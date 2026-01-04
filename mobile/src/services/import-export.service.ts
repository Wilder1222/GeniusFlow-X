import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from './ai.service';

export interface ImportCard {
    front: string;
    back: string;
    tags?: string[];
}

export interface ImportResult {
    success: boolean;
    deck_id?: string;
    cards_imported?: number;
    error?: string;
}

export const importExportService = {
    /**
     * 选择并解析文件
     */
    async pickAndParseFile(): Promise<{
        title: string;
        cards: ImportCard[];
    } | null> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'application/json', 'text/plain'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return null;

            const file = result.assets[0];
            const content = await FileSystem.readAsStringAsync(file.uri);

            if (file.name.endsWith('.json')) {
                return this.parseJSON(content, file.name);
            } else if (file.name.endsWith('.csv')) {
                return this.parseCSV(content, file.name);
            } else {
                throw new Error('Unsupported file format');
            }
        } catch (error: any) {
            console.error('Pick and parse file error:', error);
            throw error;
        }
    },

    /**
     * 解析 JSON
     */
    parseJSON(content: string, fileName: string) {
        try {
            const data = JSON.parse(content);
            const title = data.title || fileName.replace('.json', '');
            const cards = Array.isArray(data.cards) ? data.cards : [];

            return { title, cards };
        } catch (e) {
            throw new Error('Invalid JSON format');
        }
    },

    /**
     * 解析 CSV (简单实现)
     */
    parseCSV(content: string, fileName: string) {
        const lines = content.split(/\r?\n/);
        const cards: ImportCard[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;

            // 简单处理逗号分隔，不处理嵌套引号 (生产环境建议用正则或库)
            const [front, back, tagsStr] = line.split(',').map(s => s.trim());

            if (front && back) {
                cards.push({
                    front,
                    back,
                    tags: tagsStr ? tagsStr.split(';').map(t => t.trim()) : []
                });
            }
        }

        return {
            title: fileName.replace('.csv', ''),
            cards
        };
    },

    /**
     * 导入到后端
     */
    async importDeck(title: string, description: string, cards: ImportCard[]): Promise<ImportResult> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Unauthorized');

            const response = await fetch(`${API_BASE_URL}/api/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deck_title: title,
                    deck_description: description,
                    cards
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                return { success: false, error: result.error?.message || 'Import failed' };
            }

            return {
                success: true,
                deck_id: result.data.deck_id,
                cards_imported: result.data.cards_imported
            };
        } catch (error: any) {
            console.error('Import deck error:', error);
            return { success: false, error: error.message };
        }
    }
};
