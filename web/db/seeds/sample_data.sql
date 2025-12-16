-- =============================================
-- Sample Data for Development/Testing
-- =============================================
-- WARNING: Only run this on development databases!

-- Insert sample deck (requires a valid user_id)
-- Replace 'YOUR_USER_UUID' with an actual user ID from auth.users

/*
INSERT INTO decks (user_id, title, description, color, icon) VALUES
    ('YOUR_USER_UUID', '日语 N5 词汇', '日语能力考试 N5 级别基础词汇', '#ef4444', '🇯🇵'),
    ('YOUR_USER_UUID', 'Python 基础', 'Python 编程语言基础知识', '#3b82f6', '🐍'),
    ('YOUR_USER_UUID', '托福词汇', 'TOEFL 考试高频词汇', '#10b981', '📖');

-- Insert sample cards
INSERT INTO cards (deck_id, user_id, front, back, tags, state) VALUES
    ('DECK_UUID', 'YOUR_USER_UUID', '你好', 'こんにちは', ARRAY['greeting', 'basic'], 'new'),
    ('DECK_UUID', 'YOUR_USER_UUID', '谢谢', 'ありがとう', ARRAY['greeting', 'basic'], 'new'),
    ('DECK_UUID', 'YOUR_USER_UUID', 'print()', '输出函数，用于打印内容到控制台', ARRAY['function', 'basic'], 'new');
*/
