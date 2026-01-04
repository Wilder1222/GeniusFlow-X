/**
 * Sync Service - 同步服务
 * 
 * 处理离线数据的队列化和网络恢复后的自动同步
 */

import NetInfo from '@react-native-community/netinfo';
import { storage } from '../lib/mmkv';
import { cardService } from './card.service';
import { Rating } from 'ts-fsrs';

export interface SyncTask {
    id: string;
    type: 'grade_card' | 'log_review';
    payload: any;
    timestamp: number;
    retryCount: number;
}

const SYNC_QUEUE_KEY = 'sync_queue';

class SyncService {
    private isOnline: boolean = true;
    private isSyncing: boolean = false;

    constructor() {
        this.init();
    }

    private init() {
        // 监听网络状态
        NetInfo.addEventListener(state => {
            const wasOffline = !this.isOnline;
            this.isOnline = state.isConnected ?? false;

            if (this.isOnline && wasOffline) {
                console.log('Network restored, triggering sync...');
                this.processQueue();
            }
        });

        // 初始检查
        NetInfo.fetch().then(state => {
            this.isOnline = state.isConnected ?? false;
            if (this.isOnline) {
                this.processQueue();
            }
        });
    }

    /**
     * 添加任务到同步队列
     */
    async addToQueue(type: SyncTask['type'], payload: any) {
        const queue = this.getQueue();
        const newTask: SyncTask = {
            id: Math.random().toString(36).substring(7),
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0
        };

        queue.push(newTask);
        this.saveQueue(queue);

        if (this.isOnline && !this.isSyncing) {
            this.processQueue();
        }
    }

    /**
     * 处理队列中的任务
     */
    private async processQueue() {
        if (this.isSyncing) return;

        const queue = this.getQueue();
        if (queue.length === 0) return;

        console.log(`Processing sync queue, ${queue.length} tasks remaining...`);
        this.isSyncing = true;

        const remainingTasks: SyncTask[] = [];

        for (const task of queue) {
            try {
                await this.executeTask(task);
            } catch (error) {
                console.error(`Sync task ${task.id} failed:`, error);
                if (task.retryCount < 3) {
                    remainingTasks.push({ ...task, retryCount: task.retryCount + 1 });
                }
            }
        }

        this.saveQueue(remainingTasks);
        this.isSyncing = false;

        if (remainingTasks.length > 0 && this.isOnline) {
            // 如果还有失败的任务且在线，稍后重试
            setTimeout(() => this.processQueue(), 10000);
        }
    }

    private async executeTask(task: SyncTask) {
        switch (task.type) {
            case 'grade_card': {
                const { card, rating } = task.payload;
                await cardService.gradeCard(card, rating as Rating);
                break;
            }
            case 'log_review': {
                const { cardId, deckId, rating, state, newFCard } = task.payload;
                await cardService.logReview(cardId, deckId, rating, state, newFCard);
                break;
            }
            default:
                console.warn(`Unknown sync task type: ${task.type}`);
        }
    }

    private getQueue(): SyncTask[] {
        const data = storage.getString(SYNC_QUEUE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveQueue(queue: SyncTask[]) {
        storage.set(SYNC_QUEUE_KEY, JSON.stringify(queue));
    }

    getOnlineStatus() {
        return this.isOnline;
    }
}

export const syncService = new SyncService();
