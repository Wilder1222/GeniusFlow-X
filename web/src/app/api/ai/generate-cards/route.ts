import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { createAIClient, getModelName, getAIProvider, getProviderConfig } from '@/lib/ai-config';

interface GenerateCardsRequest {
    text: string;
    granularity: 'fine' | 'recommended' | 'coarse';
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
        const { text, granularity = 'recommended' } = body;

        if (!text || !text.trim() || text.trim().length < 5) {
            return NextResponse.json(
                errorResponse('INPUT_INVALID, Text must be at least 5 characters'),
                { status: 400 }
            );
        }

        // Determine card count based on granularity
        const cardCount = {
            fine: 5,
            recommended: 3,
            coarse: 1
        }[granularity];

        // Create AI client and get model
        const provider = getAIProvider();
        const client = createAIClient(provider);
        const model = getModelName();
        const config = getProviderConfig(provider);

        const prompt = `You are an expert flashcard creator. Generate ${cardCount} high-quality flashcards from the following text.

Text: ${text}

Return ONLY a JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "front": "Clear, specific question",
    "back": "Concise, complete answer",
    "tags": ["topic1", "topic2"],
    "difficulty": "easy|medium|hard"
  }
]

Guidelines:
- Questions should be unambiguous and test understanding
- Answers should be accurate and self-contained
- Focus on key concepts, definitions, and facts
- Use simple language
- Assign difficulty based on concept complexity`;

        // Call AI API
        console.log('[AI Generation] Provider:', provider, 'Model:', model);
        console.log('[AI Generation] API Key present:', !!config.apiKey);
        console.log('[AI Generation] Base URL:', config.baseURL);

        if (!config.apiKey) {
            throw new Error(`API key not configured for provider: ${provider}. Please set ${provider.toUpperCase()}_API_KEY in .env.local`);
        }

        const completion = await client.chat.completions.create({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1500
        });

        const responseText = completion.choices[0]?.message?.content;
        console.log('[AI Generation] Response:', responseText);
        if (!responseText) {
            throw new Error('Empty response from AI');
        }

        // Parse JSON response
        let cards: CardDraft[];
        try {
            // Remove markdown code blocks if present
            let cleanJson = responseText.trim();

            // Remove ```json ... ``` or ``` ... ``` blocks
            if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson
                    .replace(/^```(?:json)?\s*\n?/i, '')  // Remove opening ```json or ```
                    .replace(/\n?```\s*$/i, '')           // Remove closing ```
                    .trim();
            }

            console.log('[AI Generation] Cleaned JSON:', cleanJson);
            cards = JSON.parse(cleanJson);
            console.log('[AI Generation] Parsed cards count:', cards.length);
        } catch (e) {
            console.error('[AI Generation] Failed to parse AI response:', responseText);
            console.error('[AI Generation] Parse error:', e);
            throw new Error('AI returned invalid JSON format');
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
                promptTokens: completion.usage?.prompt_tokens,
                completionTokens: completion.usage?.completion_tokens
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
