/**
 * Simple Template Engine for Card Rendering
 * Supports {{field}} syntax for variable substitution
 */

export interface TemplateData {
    front?: string;
    back?: string;
    [key: string]: string | undefined;
}

/**
 * Render a template with provided data
 * @param template - HTML template string with {{field}} placeholders
 * @param data - Data object to substitute into template
 * @returns Rendered HTML string
 */
export function renderTemplate(template: string, data: TemplateData): string {
    if (!template) return '';

    let rendered = template;

    // Replace all {{field}} placeholders
    Object.keys(data).forEach(key => {
        const value = data[key] || '';
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        rendered = rendered.replace(regex, escapeHtml(value));
    });

    // Remove any remaining unreplaced placeholders
    rendered = rendered.replace(/\{\{[^}]+\}\}/g, '');

    return rendered;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Extract field names from a template
 * @param template - Template string
 * @returns Array of field names
 */
export function extractFields(template: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const fields: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
        const field = match[1].trim();
        if (!fields.includes(field)) {
            fields.push(field);
        }
    }

    return fields;
}

/**
 * Validate template syntax
 * @param template - Template string to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateTemplate(template: string): { isValid: boolean; error?: string } {
    if (!template || template.trim() === '') {
        return { isValid: false, error: 'Template cannot be empty' };
    }

    // Check for balanced braces
    const openBraces = (template.match(/\{\{/g) || []).length;
    const closeBraces = (template.match(/\}\}/g) || []).length;

    if (openBraces !== closeBraces) {
        return { isValid: false, error: 'Unbalanced template braces' };
    }

    // Check for empty placeholders
    if (/\{\{\s*\}\}/.test(template)) {
        return { isValid: false, error: 'Empty placeholder found' };
    }

    return { isValid: true };
}

/**
 * Default templates
 */
export const DEFAULT_TEMPLATES = {
    basic: {
        name: 'Basic',
        type: 'basic' as const,
        frontTemplate: '<div class="card-front">{{front}}</div>',
        backTemplate: '<div class="card-back"><div class="question">{{front}}</div><hr><div class="answer">{{back}}</div></div>',
        css: '.card-front, .card-back { font-size: 20px; text-align: center; padding: 40px; } .question { color: #666; margin-bottom: 20px; } .answer { color: #333; font-weight: 600; } hr { border: none; border-top: 2px solid #e0e0e0; margin: 20px 0; }'
    },
    reverse: {
        name: 'Reverse',
        type: 'reverse' as const,
        frontTemplate: '<div class="card-front">{{back}}</div>',
        backTemplate: '<div class="card-back"><div class="question">{{back}}</div><hr><div class="answer">{{front}}</div></div>',
        css: '.card-front, .card-back { font-size: 20px; text-align: center; padding: 40px; } .question { color: #666; margin-bottom: 20px; } .answer { color: #333; font-weight: 600; } hr { border: none; border-top: 2px solid #e0e0e0; margin: 20px 0; }'
    },
    cloze: {
        name: 'Cloze',
        type: 'cloze' as const,
        frontTemplate: '<div class="card-front">{{cloze}}</div>',
        backTemplate: '<div class="card-back">{{cloze}}</div>',
        css: '.card-front, .card-back { font-size: 20px; padding: 40px; } .cloze-hint { color: #2196f3; font-weight: 600; background: #e3f2fd; padding: 4px 8px; border-radius: 4px; } .cloze-answer { color: #4caf50; font-weight: 600; }'
    }
};
