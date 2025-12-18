/**
 * Apply migration 011_add_tts_settings.sql to Supabase
 * 
 * This script reads the migration file and executes it against your Supabase database.
 * Make sure you have the Supabase CLI installed or run this SQL manually in the Supabase dashboard.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
    try {
        console.log('📖 Reading migration file...');
        const migrationPath = join(process.cwd(), 'db', 'migrations', '011_add_tts_settings.sql');
        const sql = readFileSync(migrationPath, 'utf-8');

        console.log('🚀 Applying migration to database...');
        console.log('SQL:', sql);

        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // If exec_sql doesn't exist, we need to run it differently
            console.log('⚠️  exec_sql function not available, trying direct execution...');

            // Split by semicolon and execute each statement
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const statement of statements) {
                console.log('Executing:', statement.substring(0, 50) + '...');
                const { error: stmtError } = await supabase.rpc('exec', { sql: statement });
                if (stmtError) {
                    console.error('❌ Error executing statement:', stmtError);
                    throw stmtError;
                }
            }
        }

        console.log('✅ Migration applied successfully!');
        console.log('');
        console.log('📋 Summary:');
        console.log('   - Added email_notifications column to user_settings');
        console.log('   - Added tts_enabled column to user_settings');
        console.log('   - Added tts_autoplay column to user_settings');
        console.log('   - Updated existing rows with default values');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.log('');
        console.log('💡 Alternative: Run the SQL manually in Supabase Dashboard:');
        console.log('   1. Go to your Supabase project dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Copy and paste the contents of db/migrations/011_add_tts_settings.sql');
        console.log('   4. Click "Run"');
        process.exit(1);
    }
}

applyMigration();
