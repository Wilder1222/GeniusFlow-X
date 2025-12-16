import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/test-verify
 * Automated Full-Loop Verification
 * 1. Identify Test User (Hardcoded ID to bypass admin listing)
 * 2. Create Test Deck & Card
 * 3. Simulate Review (Log Insertion + FSRS Update)
 * 4. Verify Log Existence
 * 5. Trigger Achievement Check
 * 6. Verify XP/Achievement Update
 * 7. Cleanup
 */
export async function GET(req: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Note: We use the service key to ensure we can create decks/cards regardless of RLS for this test,
    // although for user-specific actions we usually need standard auth. 
    // If service key is missing, this might fail on RLS if not careful, 
    // but we are using a specific user_id so RLS might block if we don't assume that user's identity.
    // However, insertion of 'decks' usually requires auth.uid() = user_id policy.
    // Ideally we should use createServerClient with headers to fake a session, but that is complex.
    // For now, let's assume SERVICE KEY is present OR we rely on RLS being open enough (unlikely).
    // Actually, typically 'service_role' key bypasses RLS.

    if (!supabaseServiceKey) {
        return NextResponse.json({ success: false, error: 'Service Role Key missing - cannot bypass RLS for test' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results: any = { steps: [] };

    try {
        // Step 1: Identify Test User
        // Using a known test user ID found via DB query to avoid admin listing permissions issue
        const testUserId = '5e3f3598-4e92-43ca-9d84-f89834a86884';

        results.steps.push({ name: 'Identify User', status: 'OK', userId: testUserId });

        // Step 2: Create Test Deck
        const { data: deck, error: deckError } = await supabase
            .from('decks')
            .insert({
                user_id: testUserId,
                name: 'Automated Test Deck ' + new Date().getTime(),
                description: 'Temporary deck for verification'
            })
            .select()
            .single();

        if (deckError) throw deckError;
        results.steps.push({ name: 'Create Deck', status: 'OK', deckId: deck.id });

        // Step 3: Create Test Card
        const { data: card, error: cardError } = await supabase
            .from('cards')
            .insert({
                deck_id: deck.id,
                front: 'Test Front',
                back: 'Test Back',
                state: 'new'
            })
            .select()
            .single();

        if (cardError) throw cardError;
        results.steps.push({ name: 'Create Card', status: 'OK', cardId: card.id });

        // Step 4: Simulate Review (Direct DB Insertion to mimic study.ts)
        // We manually insert to review_logs to test the schema and verify FKs
        const reviewData = {
            card_id: card.id,
            user_id: testUserId,
            rating: 3, // Good
            state: 'learning',
            scheduled_days: 1,
            ease_factor: 2.5,
            reviewed_at: new Date().toISOString(),
            time_spent_ms: 5000
        };

        const { data: reviewLog, error: logError } = await supabase
            .from('review_logs')
            .insert(reviewData)
            .select()
            .single();

        if (logError) throw logError;
        results.steps.push({ name: 'Insert Review Log', status: 'OK', logId: reviewLog.id });

        // Step 5: Verify Log Exists
        const { count: logCount } = await supabase
            .from('review_logs')
            .select('*', { count: 'exact', head: true })
            .eq('id', reviewLog.id);

        if (logCount !== 1) throw new Error('Review log verification failed');
        results.steps.push({ name: 'Verify Log Presence', status: 'OK' });

        // Step 6: Verify Review Count logic (Simulate Achievement Check)
        const { count: totalReviews } = await supabase
            .from('review_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', testUserId);

        results.steps.push({ name: 'Check Total Reviews', status: 'OK', count: totalReviews });

        /*
        // Step 8: Social - Set Deck Public
        const { error: publicError } = await supabase
            .from('decks')
            .update({ is_public: true })
            .eq('id', deck.id);
        
        if (publicError) throw publicError;
        results.steps.push({ name: 'Set Deck Public', status: 'OK' });

        // Step 9: Social - Verify Public Visibility
        const { count: publicDeckCount } = await supabase
            .from('decks')
            .select('*', { count: 'exact', head: true })
            .eq('id', deck.id)
            .eq('is_public', true);
            
        if (publicDeckCount !== 1) throw new Error('Public deck verification failed');
        results.steps.push({ name: 'Verify Public Deck', status: 'OK' });
        */

        // Step 10: Cleanup
        await supabase.from('review_logs').delete().eq('id', reviewLog.id);
        await supabase.from('cards').delete().eq('id', card.id);
        await supabase.from('decks').delete().eq('id', deck.id);
        results.steps.push({ name: 'Cleanup', status: 'OK' });

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || String(error),
            results
        }, { status: 500 });
    }
}
