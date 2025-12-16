-- =============================================
-- Card Templates Table
-- 卡片模板系统
-- =============================================

CREATE TABLE IF NOT EXISTS public.card_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('basic', 'cloze', 'reverse', 'custom')),
    front_template TEXT NOT NULL, -- HTML模板
    back_template TEXT NOT NULL,  -- HTML模板
    css TEXT, -- 自定义CSS
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_card_templates_user_id ON public.card_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_card_templates_type ON public.card_templates(type);
CREATE INDEX IF NOT EXISTS idx_card_templates_public ON public.card_templates(is_public) WHERE is_public = TRUE;

-- 启用行级安全
ALTER TABLE public.card_templates ENABLE ROW LEVEL SECURITY;

-- RLS策略
CREATE POLICY "Users can view own templates"
    ON public.card_templates FOR SELECT
    USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own templates"
    ON public.card_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
    ON public.card_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
    ON public.card_templates FOR DELETE
    USING (auth.uid() = user_id);

-- 注释
COMMENT ON TABLE public.card_templates IS '卡片模板表';
COMMENT ON COLUMN public.card_templates.type IS '模板类型：basic/cloze/reverse/custom';
COMMENT ON COLUMN public.card_templates.front_template IS '正面HTML模板，支持{{field}}语法';
COMMENT ON COLUMN public.card_templates.back_template IS '背面HTML模板';
COMMENT ON COLUMN public.card_templates.css IS '自定义CSS样式';

-- 插入默认模板
INSERT INTO public.card_templates (id, user_id, name, type, front_template, back_template, css, is_public)
VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Basic',
    'basic',
    '<div class="card-front">{{front}}</div>',
    '<div class="card-back"><div class="question">{{front}}</div><hr><div class="answer">{{back}}</div></div>',
    '.card-front, .card-back { font-size: 20px; text-align: center; padding: 40px; } .question { color: #666; margin-bottom: 20px; } .answer { color: #333; font-weight: 600; } hr { border: none; border-top: 2px solid #e0e0e0; margin: 20px 0; }',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000002',
    NULL,
    'Reverse',
    'reverse',
    '<div class="card-front">{{back}}</div>',
    '<div class="card-back"><div class="question">{{back}}</div><hr><div class="answer">{{front}}</div></div>',
    '.card-front, .card-back { font-size: 20px; text-align: center; padding: 40px; } .question { color: #666; margin-bottom: 20px; } .answer { color: #333; font-weight: 600; } hr { border: none; border-top: 2px solid #e0e0e0; margin: 20px 0; }',
    TRUE
),
(
    '00000000-0000-0000-0000-000000000003',
    NULL,
    'Cloze',
    'cloze',
    '<div class="card-front">{{cloze}}</div>',
    '<div class="card-back">{{cloze}}</div>',
    '.card-front, .card-back { font-size: 20px; padding: 40px; } .cloze-hint { color: #2196f3; font-weight: 600; background: #e3f2fd; padding: 4px 8px; border-radius: 4px; } .cloze-answer { color: #4caf50; font-weight: 600; }',
    TRUE
)
ON CONFLICT (id) DO NOTHING;
