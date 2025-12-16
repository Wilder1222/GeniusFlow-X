'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components';
import LevelProgress from '@/components/gamification/level-progress';
import StatsDashboard from '@/components/stats/stats-dashboard';
import AchievementList from '@/components/gamification/achievement-list';
import ActivityHeatmap from '@/components/stats/activity-heatmap';
import { apiClient } from '@/lib/api-client';
import styles from './page.module.css';

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/stats/overview');

      // Handle 401 - user not authenticated
      if (response.status === 401) {
        console.log('[Home] User not authenticated, will be redirected by AuthProvider');
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        // Extract profile data from stats
        setProfile({
          xp: 0, // Will be updated when we implement XP tracking
          level: 1,
          currentStreak: data.data.currentStreak,
          longestStreak: data.data.longestStreak
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        {!loading && profile && (
          <div style={{ marginBottom: '24px' }}>
            <LevelProgress xp={profile.xp} level={profile.level} />
          </div>
        )}

        <StatsDashboard />

        <ActivityHeatmap />

        <AchievementList />
      </div>
    </MainLayout>
  );
}
