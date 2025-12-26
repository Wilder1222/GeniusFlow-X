import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createAIClient, getModelName, getAIProvider, getProviderConfig } from '@/lib/ai-config';
import { createRouteClient } from '@/lib/supabase-server';
import { getMembershipStatus, incrementAIUsage } from '@/lib/membership';

interface AnalyzeResumeRequest {
    resumeText: string;
    batchIndex?: number;
}

interface CardDraft {
    front: string;
    back: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
}

export async function POST(req: NextRequest) {
    try {
        const body: AnalyzeResumeRequest = await req.json();
        const { resumeText, batchIndex = 0 } = body;

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                errorResponse('简历内容太短，请上传完整的简历文件'),
                { status: 400 }
            );
        }

        // Auth check
        const supabase = createRouteClient(req);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                errorResponse('Unauthorized'),
                { status: 401 }
            );
        }

        // Membership check
        const status = await getMembershipStatus(supabase, user.id);
        if (!status.canGenerate) {
            return NextResponse.json(
                errorResponse(`LIMIT_EXCEEDED, Daily AI generation limit reached (${status.limit}). Upgrade to Pro for 200 daily generations.`),
                { status: 403 }
            );
        }

        // Split resume into sentences for interview questions
        const sentences = resumeText
            .split(/[。.！!？?\n]/)
            .map(s => s.trim())
            .filter(s => s.length > 10);

        const totalSentences = sentences.length;
        const batchSize = 10;
        const startIdx = batchIndex * batchSize;
        const endIdx = Math.min(startIdx + batchSize, totalSentences);
        const batchSentences = sentences.slice(startIdx, endIdx);
        const hasMore = endIdx < totalSentences;

        // Build prompt
        const prompt = batchIndex === 0
            ? buildFirstBatchPrompt(resumeText, batchSentences)
            : buildContinuationPrompt(batchSentences, batchIndex);

        // Create AI client
        const provider = getAIProvider();
        const client = createAIClient(provider);
        const model = getModelName();
        const config = getProviderConfig(provider);

        console.log('[Resume Analysis] Provider:', provider, 'Batch:', batchIndex);

        if (!config.apiKey) {
            throw new Error(`API key not configured for provider: ${provider}`);
        }

        const completion = await client.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4000
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error('Empty response from AI');
        }

        // Increment usage immediately after successful AI response
        await incrementAIUsage(supabase, user.id);

        // Parse response
        const result = parseAnalysisResponse(responseText, batchIndex === 0);

        return successResponse({
            suggestions: result.suggestions,
            interviewCards: result.cards,
            hasMore,
            nextBatchIndex: batchIndex + 1,
            totalSentences,
            processedSentences: endIdx
        });

    } catch (error: any) {
        console.error('Resume analysis error:', error);
        return errorResponse(new Error(error.message || '简历分析失败，请重试'));
    }
}

function buildFirstBatchPrompt(fullResume: string, batchSentences: string[]): string {
    return `You are an expert career coach and interviewer. Analyze the following resume and provide:

1. **Resume Optimization Suggestions**: 3-5 specific, actionable suggestions to improve this resume.
2. **Interview Questions**: For each key statement in the resume, generate a challenging but fair interview question that a hiring manager might ask.

Resume:
${fullResume}

Focus on these specific statements for interview questions:
${batchSentences.map((s, i) => `${i + 1}. "${s}"`).join('\n')}

Return a JSON object (no markdown wrapping) with this exact structure:
{
  "suggestions": [
    "Specific suggestion 1 in Chinese",
    "Specific suggestion 2 in Chinese"
  ],
  "cards": [
    {
      "front": "Interview question based on resume statement (in Chinese)",
      "back": "Model answer that demonstrates competency (in Chinese)",
      "tags": ["interview", "relevant-skill"],
      "difficulty": "medium"
    }
  ]
}

IMPORTANT:
- All content must be in Simplified Chinese (简体中文)
- Keep answers concise and professional
- Questions should be behavioral (STAR method style) or technical based on the resume content
- Generate up to ${batchSentences.length} interview cards`;
}

function buildContinuationPrompt(batchSentences: string[], batchIndex: number): string {
    return `Continue generating interview questions for the following resume statements. This is batch ${batchIndex + 1}.

Resume statements to create interview questions for:
${batchSentences.map((s, i) => `${i + 1}. "${s}"`).join('\n')}

Return a JSON object (no markdown wrapping) with this exact structure:
{
  "suggestions": [],
  "cards": [
    {
      "front": "Interview question based on resume statement (in Chinese)",
      "back": "Model answer that demonstrates competency (in Chinese)",
      "tags": ["interview", "relevant-skill"],
      "difficulty": "medium"
    }
  ]
}

IMPORTANT:
- All content must be in Simplified Chinese (简体中文)
- Keep answers concise and professional
- Generate up to ${batchSentences.length} interview cards`;
}

function parseAnalysisResponse(responseText: string, expectSuggestions: boolean): { suggestions: string[], cards: CardDraft[] } {
    try {
        let cleanJson = responseText.trim();

        // Remove markdown code blocks
        const codeBlockMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            cleanJson = codeBlockMatch[1].trim();
        }

        // Extract JSON object
        const objectMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            cleanJson = objectMatch[0];
        }

        const parsed = JSON.parse(cleanJson);

        return {
            suggestions: expectSuggestions ? (parsed.suggestions || []) : [],
            cards: (parsed.cards || []).map((card: any) => ({
                front: card.front?.trim() || '',
                back: card.back?.trim() || '',
                tags: card.tags || ['interview'],
                difficulty: card.difficulty || 'medium'
            })).filter((card: CardDraft) => card.front && card.back)
        };
    } catch (e) {
        console.error('[Resume Analysis] Parse error:', e);
        throw new Error('AI返回格式无效，请重试');
    }
}
