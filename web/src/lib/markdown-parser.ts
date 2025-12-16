/**
 * Parse Markdown content and convert to flashcards
 * 
 * Supported formats:
 * 1. Q&A format:
 *    Q: What is the capital of France?
 *    A: Paris
 * 
 * 2. List format:
 *    - Question | Answer
 *    - Front content | Back content
 * 
 * 3. Header as deck name:
 *    # Topic Name
 */

interface ParsedCard {
    front: string;
    back: string;
}

export function parseMarkdownToCards(markdown: string): ParsedCard[] {
    const cards: ParsedCard[] = [];
    const lines = markdown.split('\n');

    let currentQuestion: string | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines and headers
        if (!line || line.startsWith('#')) {
            continue;
        }

        // Q&A format
        if (line.startsWith('Q:') || line.startsWith('问:')) {
            currentQuestion = line.substring(2).trim();
        } else if ((line.startsWith('A:') || line.startsWith('答:')) && currentQuestion) {
            const answer = line.substring(2).trim();
            cards.push({
                front: currentQuestion,
                back: answer
            });
            currentQuestion = null;
        }
        // List format with pipe separator
        else if (line.startsWith('-') || line.startsWith('*')) {
            const content = line.substring(1).trim();
            const parts = content.split('|');

            if (parts.length >= 2) {
                cards.push({
                    front: parts[0].trim(),
                    back: parts.slice(1).join('|').trim()
                });
            }
        }
        // Double colon format: Front :: Back
        else if (line.includes('::')) {
            const parts = line.split('::');
            if (parts.length >= 2) {
                cards.push({
                    front: parts[0].trim(),
                    back: parts.slice(1).join('::').trim()
                });
            }
        }
    }

    return cards;
}

export function cardsToMarkdown(cards: Array<{ front: string; back: string }>): string {
    let markdown = '# Exported Flashcards\n\n';

    cards.forEach((card, index) => {
        markdown += `## Card ${index + 1}\n\n`;
        markdown += `Q: ${card.front}\n`;
        markdown += `A: ${card.back}\n\n`;
    });

    return markdown;
}

export function downloadMarkdown(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
