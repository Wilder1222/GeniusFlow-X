import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createAIClient, getModelName, getAIProvider, getProviderConfig } from '@/lib/ai-config';
import { createRouteClient } from '@/lib/supabase-server';
import { getMembershipStatus, incrementAIUsage } from '@/lib/membership';
import { buildDomainPrompt, AIDomain } from '@/lib/ai-domains';
import { GoogleGenAI } from '@google/genai';

interface GenerateCardsRequest {
    text: string;
    granularity?: 'fine' | 'recommended' | 'coarse';
    count?: number;
    domain?: AIDomain;
    sourceType?: 'text' | 'file';
}

interface CardDraft {
    front: string;
    back: string;
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
}

export async function POST(req: NextRequest) {
    try {
        const body: GenerateCardsRequest = await req.json();
        const { text, granularity = 'recommended', count, domain = 'general', sourceType = 'text' } = body;

        if (!text || !text.trim() || text.trim().length < 4) {
            return NextResponse.json(
                errorResponse('INPUT_INVALID, Text must be at least 4 characters'),
                { status: 400 }
            );
        }

        // 1. Check membership status and limits
        const supabase = await createRouteClient(req);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                errorResponse('Unauthorized'),
                { status: 401 }
            );
        }

        const status = await getMembershipStatus(supabase, user.id);
        if (!status.canGenerate) {
            return NextResponse.json(
                errorResponse(`LIMIT_EXCEEDED, Daily AI generation limit reached (${status.limit}). Upgrade to Pro for 200 daily generations.`),
                { status: 403 }
            );
        }

        // Build domain-specific prompt
        const prompt = buildDomainPrompt(domain, text, count);
        console.log('[AI Generation] Domain:', domain, 'Source:', sourceType);

        // Create AI client and get model
        const provider = getAIProvider();
        const model = getModelName();
        const config = getProviderConfig(provider);

        // Call AI API
        console.log('[AI Generation] Provider:', provider, 'Model:', model);
        console.log('[AI Generation] API Key present:', !!config.apiKey);
        console.log('[AI Generation] Base URL:', config.baseURL);

        if (!config.apiKey) {
            throw new Error(`API key not configured for provider: ${provider}. Please set ${provider.toUpperCase()}_API_KEY in .env.local`);
        }

        let responseText: string | undefined;
        let tokenUsage: { promptTokens?: number; completionTokens?: number } = {};

        // Handle Gemini provider separately due to different SDK
        if (provider === 'gemini') {
            const genAI = new GoogleGenAI({ apiKey: config.apiKey });
            const response = await genAI.models.generateContent({
                model: model,
                contents: prompt
            });
            responseText = response.text;
            // Gemini doesn't provide token usage in the same format
            tokenUsage = {
                promptTokens: undefined,
                completionTokens: undefined
            };
        } else {
            // OpenAI-compatible providers
            const client = createAIClient(provider);
            const completion = await client.chat.completions.create({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4000
            });
            responseText = completion.choices[0]?.message?.content ?? undefined;
            tokenUsage = {
                promptTokens: completion.usage?.prompt_tokens,
                completionTokens: completion.usage?.completion_tokens
            };
        }

        console.log('[AI Generation] Response retrieved');
        if (!responseText) {
            throw new Error('Empty response from AI');
        }

        // 3. Increment usage count immediately after successful LLM response
        try {
            await incrementAIUsage(supabase, user.id);
            const { awardXP, XP_REWARDS } = await import('@/lib/xp-service');
            await awardXP(supabase, {
                userId: user.id,
                amount: XP_REWARDS.AI_GENERATE_CARD,
                reason: 'ai_generate',
                metadata: { sourceType }
            });
        } catch (xpError) {
            console.error('[AI Generation] Usage/XP award failed:', xpError);
            // Don't fail the primary request
        }

        // 4. Parse JSON response
        let cards: CardDraft[];
        try {
            // ... parsing logic ...
            let cleanJson = responseText.trim();

            // Remove ```json ... ``` or ``` ... ``` blocks (handle multiline)
            const codeBlockMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch) {
                cleanJson = codeBlockMatch[1].trim();
            } else if (cleanJson.startsWith('```')) {
                // Fallback: remove opening and closing markers
                cleanJson = cleanJson
                    .replace(/^```(?:json)?[\s\n]*/i, '')
                    .replace(/[\s\n]*```$/i, '')
                    .trim();
            }

            // Find JSON array that contains objects (starts with [{ and ends with }])
            const objectArrayMatch = cleanJson.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (objectArrayMatch) {
                cleanJson = objectArrayMatch[0];
            }

            console.log('[AI Generation] Cleaned JSON length:', cleanJson.length);

            // Try parsing, with fallback for common issues
            try {
                cards = JSON.parse(cleanJson);
            } catch (parseError) {
                console.log('[AI Generation] First parse failed, attempting fix...');
                // Try to fix common JSON issues:
                // 1. Replace smart quotes with regular quotes
                let fixedJson = cleanJson
                    .replace(/[""]/g, '"')
                    .replace(/['']/g, "'");

                // 2. Try to extract individual card objects and rebuild array
                const cardMatches = fixedJson.match(/\{[^{}]*"front"[^{}]*"back"[^{}]*\}/g);
                if (cardMatches && cardMatches.length > 0) {
                    console.log('[AI Generation] Extracted', cardMatches.length, 'cards via regex');
                    cards = cardMatches.map(cardStr => {
                        // Extract fields using regex
                        const frontMatch = cardStr.match(/"front"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                        const backMatch = cardStr.match(/"back"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                        const tagsMatch = cardStr.match(/"tags"\s*:\s*\[(.*?)\]/);
                        const diffMatch = cardStr.match(/"difficulty"\s*:\s*"(\w+)"/);

                        if (!frontMatch || !backMatch) {
                            throw new Error('Could not extract front/back from card');
                        }

                        return {
                            front: frontMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
                            back: backMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
                            tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : [],
                            difficulty: (diffMatch?.[1] || 'medium') as 'easy' | 'medium' | 'hard'
                        };
                    });
                } else {
                    throw parseError;
                }
            }

            console.log('[AI Generation] Parsed cards count:', cards.length);
        } catch (e) {
            console.error('[AI Generation] Failed to parse AI response:', responseText);
            console.error('[AI Generation] Parse error:', e);
            throw new Error('AI返回格式无效，请重试');
        }

        // Validate structure
        console.log('[AI Generation] Is array:', Array.isArray(cards), 'Length:', cards?.length);
        if (!Array.isArray(cards) || cards.length === 0) {
            console.error('[AI Generation] Invalid array structure');
            throw new Error('AI response is not a valid array');
        }

        // Sanitize and validate each card
        const validatedCards = cards.map((card, index) => {
            if (!card.front || !card.back) {
                throw new Error(`Card ${index + 1} missing front or back`);
            }
            return {
                front: card.front.trim(),
                back: card.back.trim(),
                tags: card.tags || [],
                difficulty: card.difficulty || 'medium'
            };
        });

        console.log('[AI Generation] Validated cards:', JSON.stringify(validatedCards));


        return successResponse({
            cards: validatedCards,
            provider,
            model,
            usage: {
                promptTokens: tokenUsage.promptTokens,
                completionTokens: tokenUsage.completionTokens
            }
        });

    } catch (error: any) {
        console.error('AI generation error:', error);

        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message?.includes('API key')) {
            errorMessage = 'AI provider API key not configured. Please check your environment variables.';
        } else if (error.message?.includes('rate limit')) {
            errorMessage = 'AI provider rate limit exceeded. Please try again later.';
        }

        return errorResponse(new Error(errorMessage));
    }
}
