-- 修复 profile_settings 表的 RLS 策略
-- 添加 INSERT 权限，允许用户创建自己的设置记录

-- 1. 首先检查现有策略
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profile_settings';

-- 2. 添加 INSERT 策略（如果不存在）
DO $$
BEGIN
    -- 删除旧的 INSERT 策略（如果存在）
    DROP POLICY IF EXISTS "Users can insert own settings" ON profile_settings;
    
    -- 创建新的 INSERT 策略
    CREATE POLICY "Users can insert own settings" ON profile_settings
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
        
    RAISE NOTICE 'INSERT policy created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating policy: %', SQLERRM;
END $$;

-- 3. 验证策略
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profile_settings'
ORDER BY cmd, policyname;
