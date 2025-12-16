-- =============================================
-- GeniusFlow-X Database Schema: Social Features (社交功能)
-- =============================================

-- 关注关系表
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- 不能关注自己
);

-- 卡组分享/收藏表
CREATE TABLE IF NOT EXISTS public.deck_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    share_type TEXT DEFAULT 'bookmark' CHECK (share_type IN ('bookmark', 'fork', 'collaborate')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deck_id, user_id, share_type)
);

-- 评论表
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- 回复
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (deck_id IS NOT NULL OR card_id IS NOT NULL) -- 必须关联卡组或卡片
);

-- 点赞表
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, deck_id),
    UNIQUE(user_id, comment_id),
    CHECK (deck_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_deck_shares_deck ON deck_shares(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_shares_user ON deck_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_deck ON comments(deck_id);
CREATE INDEX IF NOT EXISTS idx_comments_card ON comments(card_id);

-- 更新时间戳触发器
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 启用 RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS 策略
CREATE POLICY "Anyone can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows
    FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Anyone can view deck shares" ON deck_shares FOR SELECT USING (true);
CREATE POLICY "Users can manage own shares" ON deck_shares
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON comments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON likes
    FOR ALL USING (auth.uid() = user_id);
