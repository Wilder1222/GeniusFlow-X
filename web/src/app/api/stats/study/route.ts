import { NextRequest } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createRouteClient(request);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return errorResponse(new Error('Unauthorized')); // Or specific 401 error
        }

        const { data, error } = await supabase
            .from('study_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            // PGRST116 means no rows returned
            if (error.code === 'PGRST116') {
                // Return default stats or create one?
                // The original logic tried to create one. Let's create one here too.
                const { data: newData, error: insertError } = await supabase
                    .from('study_stats')
                    .insert({
                        user_id: user.id,
                        total_cards_reviewed: 0,
                        total_study_time_minutes: 0,
                        current_streak: 0,
                        longest_streak: 0,
                        last_study_date: null,
                    })
                    .select('*')
                    .single();

                if (insertError) throw insertError;
                return successResponse(newData);
            }
            throw error;
        }

        return successResponse(data);

    } catch (error: any) {
        return errorResponse(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createRouteClient(request);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return errorResponse(new Error('Unauthorized'));
        }

        const body = await request.json();
        const { cardsReviewed, studyTimeMinutes } = body;

        // Fetch current stats first to calculate streaks
        const { data: currentStats } = await supabase
            .from('study_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // If no stats exist, GET logic above handles creation, but for POST we might expect it to exist or handle it gracefully.
        // For simplicity, assume it exists or use defaults if not (though update would fail).

        let currentStreak = currentStats?.current_streak || 0;
        let longestStreak = currentStats?.longest_streak || 0;
        let lastStudyDate = currentStats?.last_study_date;
        let totalCards = currentStats?.total_cards_reviewed || 0;
        let totalTime = currentStats?.total_study_time_minutes || 0;

        const today = new Date().toISOString().split('T')[0];

        if (lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastStudyDate === yesterdayStr) {
                currentStreak += 1;
            } else {
                currentStreak = 1; // Reset or start at 1
            }
            longestStreak = Math.max(longestStreak, currentStreak);
        }

        const updateData: any = {
            last_study_date: today,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            updated_at: new Date().toISOString(),
        };

        if (cardsReviewed) {
            updateData.total_cards_reviewed = totalCards + cardsReviewed;
        }
        if (studyTimeMinutes) {
            updateData.total_study_time_minutes = totalTime + studyTimeMinutes;
        }

        const { data: updatedStats, error: updateError } = await supabase
            .from('study_stats')
            .update(updateData)
            .eq('user_id', user.id)
            .select('*')
            .single();

        if (updateError) {
            // If update fails because record doesn't exist (unlikely if we checked), we could insert.
            // But for now let's assume existence or just return error.
            throw updateError;
        }

        return successResponse(updatedStats);

    } catch (error: any) {
        return errorResponse(error);
    }
}
