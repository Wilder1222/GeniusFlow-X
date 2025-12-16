/**
 * .apkg Import/Export Library
 * 
 * This module handles Anki .apkg file import and export
 * Uses sql.js loaded from CDN to avoid bundler issues
 */

import JSZip from 'jszip';

interface AnkiNote {
    id: number;
    guid: string;
    mid: number;
    tags: string;
    flds: string;
}

interface ParsedCard {
    front: string;
    back: string;
    tags: string[];
    state: string;
}

export interface ApkgImportResult {
    deckName: string;
    cards: ParsedCard[];
    mediaFiles: Map<string, Blob>;
}

// Global SQL.js instance
declare global {
    interface Window {
        initSqlJs: any;
    }
}

/**
 * Load SQL.js from CDN
 */
async function loadSqlJs() {
    // Check if already loaded
    if (window.initSqlJs) {
        return window.initSqlJs;
    }

    // Load sql.js from CDN
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
        script.onload = () => {
            resolve(window.initSqlJs);
        };
        script.onerror = () => {
            reject(new Error('Failed to load sql.js from CDN'));
        };
        document.head.appendChild(script);
    });
}

/**
 * Parse .apkg file and extract cards
 */
export async function parseApkg(file: File): Promise<ApkgImportResult> {
    // Ensure we're in browser
    if (typeof window === 'undefined') {
        throw new Error('parseApkg can only be called in browser');
    }

    const zip = await JSZip.loadAsync(file);

    // Extract collection.anki2
    const collectionFile = zip.file('collection.anki2') || zip.file('collection.anki21');
    if (!collectionFile) {
        throw new Error('Invalid .apkg file: collection database not found');
    }

    const collectionData = await collectionFile.async('uint8array');

    // Load SQL.js from CDN
    const initSqlJs = await loadSqlJs();

    // Initialize SQL.js  
    const SQL = await initSqlJs({
        locateFile: () => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm'
    });

    const db = new SQL.Database(collectionData);

    // Extract deck name
    const colResult = db.exec('SELECT decks FROM col');
    let deckName = 'Imported Deck';
    if (colResult.length > 0 && colResult[0].values.length > 0) {
        try {
            const decksJson = JSON.parse(colResult[0].values[0][0] as string);
            const firstDeckId = Object.keys(decksJson)[1];
            if (firstDeckId && decksJson[firstDeckId]) {
                deckName = decksJson[firstDeckId].name || deckName;
            }
        } catch (e) {
            console.warn('Could not parse deck name', e);
        }
    }

    // Query notes
    const notesResult = db.exec('SELECT id, flds, tags FROM notes');
    const notes = new Map<number, { fields: string[], tags: string }>();

    if (notesResult.length > 0) {
        for (const row of notesResult[0].values) {
            const id = row[0] as number;
            const flds = row[1] as string;
            const tags = row[2] as string;
            const fields = flds.split('\x1f');
            notes.set(id, { fields, tags });
        }
    }

    // Query cards
    const cardsResult = db.exec('SELECT nid, ord, type, queue FROM cards');
    const cards: ParsedCard[] = [];

    if (cardsResult.length > 0) {
        for (const row of cardsResult[0].values) {
            const nid = row[0] as number;
            const type = row[2] as number;

            const note = notes.get(nid);
            if (!note) continue;

            const front = note.fields[0] || '';
            const back = note.fields[1] || '';

            let state = 'new';
            if (type === 1) state = 'learning';
            else if (type === 2) state = 'review';

            cards.push({
                front: stripHtml(front),
                back: stripHtml(back),
                tags: note.tags.split(' ').filter(t => t),
                state
            });
        }
    }

    // Extract media files
    const mediaFiles = new Map<string, Blob>();
    const mediaFile = zip.file('media');

    if (mediaFile) {
        const mediaJson = await mediaFile.async('string');
        const mediaMapping = JSON.parse(mediaJson);

        for (const [num, filename] of Object.entries(mediaMapping)) {
            const file = zip.file(num);
            if (file) {
                const blob = await file.async('blob');
                mediaFiles.set(filename as string, blob);
            }
        }
    }

    db.close();

    return {
        deckName,
        cards,
        mediaFiles
    };
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
    if (typeof document === 'undefined') return html;
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Export cards to .apkg format
 */
export async function exportToApkg(
    deckName: string,
    cards: Array<{ front: string; back: string }>
): Promise<Blob> {
    throw new Error('Export not yet implemented');
}
