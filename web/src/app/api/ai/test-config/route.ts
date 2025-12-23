import { NextResponse } from 'next/server';
import { getAIProvider, getModelName, createAIClient } from '@/lib/ai-config';

export async function GET() {
    try {
        const provider = getAIProvider();
        const model = getModelName();

        return NextResponse.json({
            success: true,
            provider,
            model,
            status: 'Configuration loaded successfully'
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
