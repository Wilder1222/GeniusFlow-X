import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createAIClient, getModelName, getAIProvider, getProviderConfig } from '@/lib/ai-config';
import { createRouteClient } from '@/lib/supabase-server';
import { getMembershipStatus, incrementAIUsage } from '@/lib/membership';

interface RegenerateCardRequest {
    originalCard: {
        front: string;
        back: string;
    };
    context?: string; // Optional context (e.g., topic or resume excerpt)
    instruction?: string; // User instruction for regeneration
}

export async function POST(req: NextRequest) {
    try {
        const body: RegenerateCardRequest = await req.json();
        const { originalCard, context, instruction } = body;

        if (!originalCard?.front) {
            return NextResponse.json(
                errorResponse('原始卡片内容不能为空'),
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
                errorResponse(`LIMIT_EXCEEDED, Daily AI generation limit reached (${status.limit}).`),
                { status: 403 }
            );
        }

        // Build prompt
        const prompt = `You are an expert flashcard creator. Regenerate a better version of this flashcard.

Original Question: ${originalCard.front}
Original Answer: ${originalCard.back}
${context ? `Context: ${context}` : ''}
${instruction ? `User Instruction: ${instruction}` : 'Please create an improved version with a clearer question and more comprehensive answer.'}

Return a JSON object (no markdown wrapping) with this exact structure:
{
  "front": "Improved question in Chinese (简体中文)",
  "back": "Improved answer in Chinese (简体中文)",
  "tags": ["relevant", "tags"],
  "difficulty": "easy|medium|hard"
}

IMPORTANT:
- Output must be in Simplified Chinese (简体中文)
- Make the question more specific and testable
- Make the answer more comprehensive but concise
- Keep inline code format with single backticks if needed`;

        // Create AI client
        const provider = getAIProvider();
        const client = createAIClient(provider);
        const model = getModelName();
        const config = getProviderConfig(provider);

        if (!config.apiKey) {
            throw new Error(`API key not configured for provider: ${provider}`);
        }

        const completion = await client.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 1000
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error('Empty response from AI');
        }

        // Increment usage immediately after successful AI response
        await incrementAIUsage(supabase, user.id);

        // Parse response
        let cleanJson = responseText.trim();
        const codeBlockMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            cleanJson = codeBlockMatch[1].trim();
        }
        const objectMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            cleanJson = objectMatch[0];
        }

        const newCard = JSON.parse(cleanJson);

        return successResponse({
            card: {
                front: newCard.front?.trim() || originalCard.front,
                back: newCard.back?.trim() || originalCard.back,
                tags: newCard.tags || [],
                difficulty: newCard.difficulty || 'medium'
            }
        });

    } catch (error: any) {
        console.error('Card regeneration error:', error);
        return errorResponse(new Error(error.message || '卡片重新生成失败，请重试'));
    }
}
