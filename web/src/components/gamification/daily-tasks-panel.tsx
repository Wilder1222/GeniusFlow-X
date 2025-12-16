'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import styles from './daily-tasks-panel.module.css';

interface DailyTask {
    id: string;
    task_key: string;
    task_name: string;
    task_description: string;
    target: number;
    progress: number;
    xp_reward: number;
    completed: boolean;
}

export default function DailyTasksPanel() {
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const result = await apiClient.get<{ success: boolean; data: DailyTask[] }>('/api/tasks/daily');
            if (result.success) {
                setTasks(result.data);
            }
        } catch (error) {
            console.error('Failed to load daily tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>加载中...</div>
            </div>
        );
    }

    const completedCount = tasks.filter(t => t.completed).length;
    const totalXP = tasks.reduce((sum, t) => sum + (t.completed ? t.xp_reward : 0), 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>📋 每日任务</h2>
                <div className={styles.summary}>
                    {completedCount}/{tasks.length} 完成 · {totalXP} XP
                </div>
            </div>

            <div className={styles.tasksList}>
                {tasks.map(task => {
                    const progressPercent = Math.min(100, (task.progress / task.target) * 100);

                    return (
                        <div key={task.id} className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}>
                            <div className={styles.taskHeader}>
                                <div className={styles.taskInfo}>
                                    <h3 className={styles.taskName}>{task.task_name}</h3>
                                    <p className={styles.taskDescription}>{task.task_description}</p>
                                </div>
                                <div className={styles.taskReward}>
                                    {task.completed ? '✅' : `+${task.xp_reward} XP`}
                                </div>
                            </div>

                            <div className={styles.progressContainer}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className={styles.progressText}>
                                    {task.progress} / {task.target}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {completedCount === tasks.length && (
                <div className={styles.allCompleted}>
                    🎉 今日任务全部完成！明天再来吧！
                </div>
            )}
        </div>
    );
}
