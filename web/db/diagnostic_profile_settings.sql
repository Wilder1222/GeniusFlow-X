-- 诊断 SQL：检查 profile_settings 表状态
-- 请在 Supabase SQL Editor 中执行此查询

-- 1. 检查表是否存在
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profile_settings'
) as table_exists;

-- 2. 检查表结构（所有列）
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profile_settings'
ORDER BY ordinal_position;

-- 3. 检查表中的记录数
SELECT COUNT(*) as total_records FROM public.profile_settings;

-- 4. 查看所有记录（前5条）
SELECT * FROM public.profile_settings LIMIT 5;

-- 5. 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profile_settings';

-- 6. 查看 RLS 策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profile_settings';

-- 7. 如果你已登录，检查当前用户的设置
-- 替换 'YOUR_USER_ID' 为你的实际 user_id
-- SELECT * FROM public.profile_settings WHERE user_id = 'YOUR_USER_ID';
