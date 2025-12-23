import OpenAI from 'openai';

// AI Provider configuration
export type AIProvider = 'openai' | 'anthropic' | 'deepseek' | 'zhipu' | 'moonshot' | 'mimo';

interface ProviderConfig {
    apiKey: string;
    baseURL?: string;
    model: string;
}

// Get provider from environment or default to OpenAI
export function getAIProvider(): AIProvider {
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase() as AIProvider;
    console.log('[AI Generation] Provider:', provider);
    return provider;
}

// Get configuration for the selected provider
export function getProviderConfig(provider: AIProvider): ProviderConfig {
    switch (provider) {
        case 'openai':
            return {
                apiKey: process.env.OPENAI_API_KEY || '',
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
            };

        case 'anthropic':
            return {
                apiKey: process.env.ANTHROPIC_API_KEY || '',
                baseURL: 'https://api.anthropic.com/v1',
                model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022'
            };

        case 'deepseek':
            return {
                apiKey: process.env.DEEPSEEK_API_KEY || '',
                baseURL: 'https://api.deepseek.com/v1',
                model: process.env.DEEPSEEK_MODEL || 'deepseek-reasoner'
            };

        case 'zhipu':
            return {
                apiKey: process.env.ZHIPU_API_KEY || '',
                baseURL: 'https://open.bigmodel.cn/api/paas/v4',
                model: process.env.ZHIPU_MODEL || 'glm-4-flash'
            };

        case 'moonshot':
            return {
                apiKey: process.env.MOONSHOT_API_KEY || '',
                baseURL: 'https://api.moonshot.cn/v1',
                model: process.env.MOONSHOT_MODEL || 'moonshot-v1-8k'
            };

        case 'mimo':
            return {
                apiKey: process.env.MIMO_API_KEY || '',
                baseURL: 'https://api.xiaomimimo.com/v1',
                model: process.env.MIMO_MODEL || 'mimo-v2-flash'
            };

        default:
            throw new Error(`Unknown AI provider: ${provider}`);
    }
}

// Create OpenAI client (works for most providers)
export function createAIClient(provider?: AIProvider): OpenAI {
    const selectedProvider = provider || getAIProvider();
    const config = getProviderConfig(selectedProvider);

    if (!config.apiKey) {
        throw new Error(`API key not configured for provider: ${selectedProvider}`);
    }

    return new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        defaultHeaders: selectedProvider === 'mimo' ? { 'api-key': config.apiKey } : undefined,
        dangerouslyAllowBrowser: false // Server-side only
    });
}

// Get model name for the current provider
export function getModelName(provider?: AIProvider): string {
    const selectedProvider = provider || getAIProvider();
    const config = getProviderConfig(selectedProvider);
    return config.model;
}
