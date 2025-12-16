import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { successResponse, errorResponse } from '@/lib/api-response';
import { AppError, ErrorCode } from '@/lib/errors';

/**
 * Daily task definitions
 */
const TASK_DEFINITIONS = [
    {
        key: 'daily_review',
        name: '每日复习',
        description: '复习20张卡片',
        target: 20,
        xp_reward: 30
    },
    {
        key: 'daily_create',
        name: '每日创作',
        description: '创建5张卡片',
        target: 5,
        xp_reward: 25
    },
    {
        key: 'daily_accuracy',
        name: '精准学习',
        description: '达到80%准确率',
        target: 80,
        xp_reward: 40
    }
];

/**
 * GET /api/tasks/daily
 * Get today's tasks, generate if not exist
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

        const today = new Date().toISOString().split('T')[0];

        // Get existing tasks for today
        const { data: existingTasks } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today);

        // If no tasks, generate them
        if (!existingTasks || existingTasks.length === 0) {
            // Randomly select 3 tasks
            const shuffled = [...TASK_DEFINITIONS].sort(() => Math.random() - 0.5);
            const selectedTasks = shuffled.slice(0, 3);

            const tasksToInsert = selectedTasks.map(task => ({
                user_id: user.id,
                task_key: task.key,
                task_name: task.name,
                task_description: task.description,
                target: task.target,
                progress: 0,
                xp_reward: task.xp_reward,
                completed: false,
                date: today
            }));

            const { data: newTasks, error: insertError } = await supabase
                .from('daily_tasks')
                .insert(tasksToInsert)
                .select();

            if (insertError) {
                console.error('[Daily Tasks] Error creating tasks:', insertError);
                return errorResponse(insertError);
            }

            return successResponse(newTasks || []);
        }

        return successResponse(existingTasks);

    } catch (error: any) {
        console.error('[Daily Tasks] Error:', error);
        return errorResponse(error);
    }
}

/**
 * POST /api/tasks/daily
 * Update task progress
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

        const body = await req.json();
        const { taskId, progress } = body;

        if (!taskId || typeof progress !== 'number') {
            return errorResponse(new AppError('Missing taskId or progress', ErrorCode.INVALID_INPUT, 400));
        }

        // Get task
        const { data: task } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('id', taskId)
            .eq('user_id', user.id)
            .single();

        if (!task) {
            return errorResponse(new AppError('Task not found', ErrorCode.NOT_FOUND, 404));
        }

        const newProgress = Math.min(progress, task.target);
        const completed = newProgress >= task.target;

        // Update task
        const { error: updateError } = await supabase
            .from('daily_tasks')
            .update({
                progress: newProgress,
                completed,
                completed_at: completed ? new Date().toISOString() : null
            })
            .eq('id', taskId);

        if (updateError) {
            console.error('[Daily Tasks] Error updating task:', updateError);
            return errorResponse(updateError);
        }

        // Award XP if just completed
        if (completed && !task.completed) {
            await supabase
                .from('profiles')
                .update({
                    xp: supabase.rpc('increment', { x: task.xp_reward })
                })
                .eq('id', user.id);

            await supabase
                .from('xp_transactions')
                .insert({
                    user_id: user.id,
                    amount: task.xp_reward,
                    reason: 'daily_task',
                    metadata: { task_key: task.task_key, task_name: task.task_name }
                });
        }

        return successResponse({
            taskId,
            progress: newProgress,
            completed,
            xpAwarded: completed && !task.completed ? task.xp_reward : 0
        });

    } catch (error: any) {
        console.error('[Daily Tasks] Error:', error);
        return errorResponse(error);
    }
}
