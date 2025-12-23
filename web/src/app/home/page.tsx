'use client';

import { useEffect, useState, useRef } from 'react';
import { MainLayout } from '@/components';
import { StatsProvider, useStats } from '@/lib/contexts/stats-context';
import LevelProgress from '@/components/gamification/level-progress';
import StatsDashboard from '@/components/stats/stats-dashboard';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { LuPlay, LuPlus, LuLayoutDashboard, LuHistory, LuRocket } from 'react-icons/lu';
import { CreateDeckModal } from '@/components/decks/create-deck-modal';
import AIEntryCard from '@/components/home/ai-entry-card';
import { AIGeneratorModal } from '@/components/ai/ai-generator-modal';
import { createDeck } from '@/lib/decks';
import { useRouter } from 'next/navigation';
import { Deck } from '@/types/decks';
import styles from './page.module.css';

// Inner component that uses Stats Context
function DashboardContent() {
  const { user } = useAuth();
  const { streak: profile, loading: statsLoading } = useStats();
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [decksLoading, setDecksLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const isFetchingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchDecks();
    }
  }, [user]);

  // Only fetch decks - streak data comes from context
  const fetchDecks = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const decksRes = await apiClient.get('/api/decks');
      if (decksRes.success) {
        setRecentDecks(decksRes.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch decks:', error);
    } finally {
      setDecksLoading(false);
      // We don't reset isFetchingRef here to ensure it only runs once per mount
      // unless we want to allow refreshing. Since it's in a useEffect with [user],
      // once per user session mount is usually enough.
    }
  };

  const handleCreateDeck = async (data: { title: string; description: string; is_public: boolean }) => {
    if (!user) return;
    try {
      const newDeck = await createDeck(user.id, data);
      router.push(`/decks/${newDeck.id}`);
    } catch (error) {
      console.error('Failed to create deck:', error);
      alert('创建失败，请重试');
    }
  };

  const handleAISuccess = (deckId: string) => {
    router.push(`/decks/${deckId}`);
  };

  const loading = statsLoading || decksLoading;

  return (
    <>
      <div className={styles.container}>
        {/* Top: Welcome & Profile */}
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeText}>
            <h1>欢迎回来, <span className={styles.userName}>{user?.email?.split('@')[0] || 'Learning Master'}</span> <LuRocket className={styles.rocketIcon} /></h1>
            <p>今天也是充满进步的一天，准备好开始挑战了吗？</p>
          </div>
          {!statsLoading && profile && (
            <div className={styles.levelWrapper}>
              <LevelProgress xp={profile.xp} level={profile.level} />
            </div>
          )}
        </section>

        {/* AI Entry Card - Main Feature */}
        <section className={styles.aiSection}>
          <AIEntryCard onStart={() => setShowAIModal(true)} />
        </section>

        {/* Middle: Quick Actions */}
        <section className={styles.quickActions}>
          <Link href="/study" className={`${styles.actionCard} ${styles.primaryAction}`}>
            <div className={styles.actionIcon}><LuPlay /></div>
            <div className={styles.actionInfo}>
              <h3>开始复习</h3>
              <p>挑战今日记忆任务</p>
            </div>
          </Link>
          <div onClick={() => setShowCreateModal(true)} className={styles.actionCard} style={{ cursor: 'pointer' }}>
            <div className={styles.actionIcon}><LuPlus /></div>
            <div className={styles.actionInfo}>
              <h3>创建新牌组</h3>
              <p>构建你的知识库</p>
            </div>
          </div>
          <Link href="/decks" className={styles.actionCard}>
            <div className={styles.actionIcon}><LuLayoutDashboard /></div>
            <div className={styles.actionInfo}>
              <h3>管理牌组</h3>
              <p>查看并优化所有内容</p>
            </div>
          </Link>
        </section>

        {/* Bottom: Main Dashboard Grid */}
        <div className={styles.mainGrid}>
          <div className={styles.leftColumn}>
            <StatsDashboard />
          </div>

          <div className={styles.rightColumn}>
            {/* Recent Decks */}
            <section className={styles.sideSection}>
              <div className={styles.sectionHeader}>
                <LuHistory /> <h3>最近学习</h3>
              </div>
              <div className={styles.recentList}>
                {recentDecks.length > 0 ? (
                  recentDecks.map((deck) => (
                    <Link key={deck.id} href={`/decks/${deck.id}`} className={styles.deckItem}>
                      <div className={styles.deckEmoji}>📚</div>
                      <div className={styles.deckInfo}>
                        <h4>{deck.title}</h4>
                        <p>{new Date(deck.created_at).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>暂无最近牌组，快去创建一个吧！</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <CreateDeckModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDeck}
      />

      <AIGeneratorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSuccess={handleAISuccess}
      />
    </>
  );
}

// Page component wraps with StatsProvider
export default function Dashboard() {
  return (
    <MainLayout>
      <StatsProvider>
        <DashboardContent />
      </StatsProvider>
    </MainLayout>
  );
}
