import { NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * GET /api/stats/retention
 * 计算基于review_logs的真实留存率数据
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = createRouteClient(req);

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return errorResponse(new AppError('Unauthorized', ErrorCode.UNAUTHORIZED, 401));
        }

        // 获取所有复习记录
        const { data: reviewLogs, error: logsError } = await supabase
            .from('review_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('reviewed_at', { ascending: true });

        if (logsError) {
            console.error('[Retention] Error fetching review logs:', logsError);
            return errorResponse(logsError);
        }

        if (!reviewLogs || reviewLogs.length === 0) {
            return successResponse({
                retention24h: 0,
                retention7d: 0,
                retention30d: 0,
                byDifficulty: {
                    again: { total: 0, retained: 0, rate: 0 },
                    hard: { total: 0, retained: 0, rate: 0 },
                    good: { total: 0, retained: 0, rate: 0 },
                    easy: { total: 0, retained: 0, rate: 0 }
                },
                chartData: []
            });
        }

        const now = new Date();
        const day24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const day7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const day30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // 计算留存率：某个时间点学习的卡片，在后续复习中答对的比例
        const calculateRetention = (afterDate: Date) => {
            const logsAfterDate = reviewLogs.filter(log =>
                new Date(log.reviewed_at) > afterDate
            );

            if (logsAfterDate.length === 0) return 0;

            // rating >= 3 (Good/Easy) 视为记住
            const retained = logsAfterDate.filter(log => log.rating >= 3).length;
            return Math.round((retained / logsAfterDate.length) * 100);
        };

        const retention24h = calculateRetention(day24hAgo);
        const retention7d = calculateRetention(day7Ago);
        const retention30d = calculateRetention(day30Ago);

        // 按难度等级统计
        const difficultyMap: Record<number, 'again' | 'hard' | 'good' | 'easy'> = {
            1: 'again',
            2: 'hard',
            3: 'good',
            4: 'easy'
        };

        const byDifficulty = {
            again: { total: 0, retained: 0, rate: 0 },
            hard: { total: 0, retained: 0, rate: 0 },
            good: { total: 0, retained: 0, rate: 0 },
            easy: { total: 0, retained: 0, rate: 0 }
        };

        reviewLogs.forEach(log => {
            const difficulty = difficultyMap[log.rating];
            if (difficulty) {
                byDifficulty[difficulty].total++;
                if (log.rating >= 3) {
                    byDifficulty[difficulty].retained++;
                }
            }
        });

        // 计算每个难度的留存率
        Object.keys(byDifficulty).forEach(key => {
            const diff = byDifficulty[key as keyof typeof byDifficulty];
            diff.rate = diff.total > 0 ? Math.round((diff.retained / diff.total) * 100) : 0;
        });

        // 生成图表数据：每天的留存率
        const chartData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dayLogs = reviewLogs.filter(log =>
                log.reviewed_at.startsWith(dateStr)
            );

            if (dayLogs.length > 0) {
                const retained = dayLogs.filter(log => log.rating >= 3).length;
                const rate = Math.round((retained / dayLogs.length) * 100);
                chartData.push({
                    date: dateStr,
                    rate,
                    total: dayLogs.length
                });
            } else {
                chartData.push({
                    date: dateStr,
                    rate: 0,
                    total: 0
                });
            }
        }

        return successResponse({
            retention24h,
            retention7d,
            retention30d,
            byDifficulty,
            chartData
        });

    } catch (error: any) {
        console.error('[Retention] Error:', error);
        return errorResponse(error);
    }
}
