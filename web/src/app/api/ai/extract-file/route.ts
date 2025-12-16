import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * POST /api/ai/extract-file
 * Extract text from uploaded file (PDF, DOCX, TXT)
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return req.cookies.get(name)?.value;
                    },
                    set() { },
                    remove() { }
                }
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return errorResponse(new AppError('No file provided', ErrorCode.INVALID_INPUT, 400));
        }

        const filename = file.name.toLowerCase();
        let extractedText = '';

        // Handle TXT files
        if (filename.endsWith('.txt')) {
            extractedText = await file.text();
        }
        // Handle PDF files
        else if (filename.endsWith('.pdf')) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const pdfParseImport = (await import('pdf-parse')) as any;
                const pdfParse = pdfParseImport.default || pdfParseImport;
                const pdfData = await pdfParse(buffer);
                extractedText = pdfData.text;
            } catch (pdfError) {
                console.error('[Extract] PDF parsing error:', pdfError);
                return errorResponse(new AppError('Failed to parse PDF', ErrorCode.INVALID_INPUT, 400));
            }
        }
        // Handle DOCX files - basic text extraction
        else if (filename.endsWith('.docx')) {
            try {
                // Simple DOCX handling - extract text from XML
                const buffer = Buffer.from(await file.arrayBuffer());
                const JSZipImport = (await import('jszip')) as any;
                const JSZip = JSZipImport.default || JSZipImport;
                const zip = await JSZip.loadAsync(buffer);
                const contentXml = await zip.file('word/document.xml')?.async('string');

                if (contentXml) {
                    // Simple regex to extract text from XML
                    extractedText = contentXml
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                }
            } catch (docxError) {
                console.error('[Extract] DOCX parsing error:', docxError);
                return errorResponse(new AppError('Failed to parse DOCX', ErrorCode.INVALID_INPUT, 400));
            }
        }
        else {
            return errorResponse(new AppError('Unsupported file format', ErrorCode.INVALID_INPUT, 400));
        }

        // Clean up text
        extractedText = extractedText
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        return successResponse({
            text: extractedText,
            filename: file.name,
            size: file.size,
            charCount: extractedText.length
        });

    } catch (error: any) {
        console.error('[Extract] Error:', error);
        return errorResponse(error);
    }
}
