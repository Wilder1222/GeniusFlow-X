import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * GET /api/stats/charts
 * 提供图表数据：每日复习趋势、正确率变化、学习时长分布
 */
export async function GET(req: NextRequest) {
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

        // 获取最近30天的复习记录
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: reviewLogs, error: logsError } = await supabase
            .from('review_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('reviewed_at', thirtyDaysAgo.toISOString())
            .order('reviewed_at', { ascending: true });

        if (logsError) {
            console.error('[Charts] Error fetching review logs:', logsError);
            return errorResponse(logsError);
        }

        if (!reviewLogs || reviewLogs.length === 0) {
            return successResponse({
                dailyReviews: [],
                accuracyTrend: [],
                ratingDistribution: {
                    again: 0,
                    hard: 0,
                    good: 0,
                    easy: 0
                }
            });
        }

        // 1. 每日复习数量趋势
        const dailyReviewsMap = new Map<string, { date: string; count: number; correct: number }>();
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            dailyReviewsMap.set(dateStr, { date: dateStr, count: 0, correct: 0 });
        }

        reviewLogs.forEach(log => {
            const dateStr = log.reviewed_at.split('T')[0];
            const dayData = dailyReviewsMap.get(dateStr);
            if (dayData) {
                dayData.count++;
                if (log.rating >= 3) {
                    dayData.correct++;
                }
            }
        });

        const dailyReviews = Array.from(dailyReviewsMap.values());

        // 2. 正确率变化曲线（每天的正确率）
        const accuracyTrend = dailyReviews.map(day => ({
            date: day.date,
            accuracy: day.count > 0 ? Math.round((day.correct / day.count) * 100) : 0,
            count: day.count
        }));

        // 3. 评分分布
        const ratingDistribution = {
            again: 0,
            hard: 0,
            good: 0,
            easy: 0
        };

        const ratingMap: Record<number, keyof typeof ratingDistribution> = {
            1: 'again',
            2: 'hard',
            3: 'good',
            4: 'easy'
        };

        reviewLogs.forEach(log => {
            const rating = ratingMap[log.rating];
            if (rating) {
                ratingDistribution[rating]++;
            }
        });

        return successResponse({
            dailyReviews,
            accuracyTrend,
            ratingDistribution
        });

    } catch (error: any) {
        console.error('[Charts] Error:', error);
        return errorResponse(error);
    }
}
