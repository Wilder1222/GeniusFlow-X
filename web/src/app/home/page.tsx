'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components';
import LevelProgress from '@/components/gamification/level-progress';
import StatsDashboard from '@/components/stats/stats-dashboard';
import ActivityHeatmap from '@/components/stats/activity-heatmap';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { LuPlay, LuPlus, LuLayoutDashboard, LuHistory, LuRocket } from 'react-icons/lu';
import { CreateDeckModal } from '@/components/decks/create-deck-modal';
import { createDeck } from '@/lib/decks';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [recentDecks, setRecentDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [streakRes, decksRes] = await Promise.all([
        apiClient.get('/api/stats/streak'),
        apiClient.get('/api/decks')
      ]);

      if (streakRes.success) {
        setProfile(streakRes.data);
      }

      if (decksRes.success) {
        setRecentDecks(decksRes.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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

  return (
    <MainLayout>
      <div className={styles.container}>
        {/* Top: Welcome & Profile */}
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeText}>
            <h1>欢迎回来, <span className={styles.userName}>{user?.email?.split('@')[0] || 'Learning Master'}</span> <LuRocket className={styles.rocketIcon} /></h1>
            <p>今天也是充满进步的一天，准备好开始挑战了吗？</p>
          </div>
          {!loading && profile && (
            <div className={styles.levelWrapper}>
              <LevelProgress xp={profile.xp} level={profile.level} />
            </div>
          )}
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
            <StatsDashboard simplified={true} />
            <div className={styles.heatmapWrapper}>
              <ActivityHeatmap />
            </div>
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
    </MainLayout>
  );
}
