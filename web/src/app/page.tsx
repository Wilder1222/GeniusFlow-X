'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LuBrain,
  LuChartBar,
  LuGamepad2,
  LuPalette,
  LuCloud,
  LuShield,
  LuZap,
  LuTarget,
  LuTrendingUp,
  LuSparkles,
} from 'react-icons/lu';
import AIDemo from '@/components/landing/ai-demo';
import BenefitsCarousel from '@/components/landing/benefits-carousel';
import FeaturesMarquee from '@/components/landing/features-marquee';
import UserSettingsPanel from '@/components/user-settings-panel';
import { useAuth } from '@/lib/auth-context';
import styles from './page.module.css';

// Feature data - reordered to highlight AI first
const features = [
  {
    Icon: LuBrain,
    title: '间隔重复算法',
    description: '基于科学记忆曲线的SM-2算法，在最佳时机复习，让记忆效率提升3倍以上。'
  },
  {
    Icon: LuChartBar,
    title: '数据驱动学习',
    description: '详细的学习统计和可视化分析，追踪您的进步，找出薄弱环节，持续优化学习策略。'
  },
  {
    Icon: LuGamepad2,
    title: '游戏化激励',
    description: '经验值、等级、成就徽章和连续学习天数，让学习像游戏一样有趣且令人上瘾。'
  },
  {
    Icon: LuPalette,
    title: '富媒体卡片',
    description: '支持文字、图片、音频、代码等多种格式，创建生动有趣的学习卡片。'
  },
  {
    Icon: LuCloud,
    title: '云端同步',
    description: '数据安全存储在云端，随时随地在任何设备上继续学习，永不丢失进度。'
  },
  {
    Icon: LuShield,
    title: '隐私保护',
    description: '您的学习数据完全安全，我们采用业界领先的加密技术保护您的隐私。'
  }
];

// Benefit data
const benefits = [
  {
    Icon: LuZap,
    title: '10倍效率提升',
    description: 'AI辅助创建闪卡，告别繁琐的手动输入，专注于学习本身。'
  },
  {
    Icon: LuTarget,
    title: '精准记忆',
    description: '科学算法确保您在遗忘之前复习，大幅提高长期记忆保留率。'
  },
  {
    Icon: LuTrendingUp,
    title: '可视化进步',
    description: '清晰的数据仪表板让您的每一点进步都清晰可见，持续保持动力。'
  },
  {
    Icon: LuSparkles,
    title: '愉悦体验',
    description: '精心设计的界面和动效，让学习成为一种享受而非负担。'
  }
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.landing}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>📕</span>
          <span className={styles.title}>GeniusFlow-X</span>
        </Link>

        <div className={styles.navLinks}>
          {user && <Link href="/home" className={styles.navLink}>Home</Link>}
          <a href="#ai-demo" className={styles.navLink}>AI 演示</a>
          <a href="#features" className={styles.navLink}>功能</a>
          <a href="#benefits" className={styles.navLink}>优势</a>
        </div>

        <div className={styles.navActions}>
          {loading ? (
            <span className={styles.loadingText}>加载中...</span>
          ) : user ? (
            <UserSettingsPanel />
          ) : (
            <>
              <Link href="/auth/login" className={styles.loginBtn}>登录</Link>
              <Link href="/auth/signup" className={styles.signupBtn}>免费注册</Link>
            </>
          )}
        </div>

        <button className={styles.mobileMenuBtn} aria-label="菜单">
          <span className={styles.mobileMenuIcon}></span>
        </button>
      </nav>

      {/* Hero Section - Updated to highlight AI */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>
            <span className={styles.badgeEmoji}>🤖</span>
            <span>AI 驱动 · 对话生成 · 智能学习</span>
          </span>

          <h1 className={styles.heroTitle}>
            与 AI 对话<br />
            <span className={styles.gradient}>秒生闪卡</span>
          </h1>

          <p className={styles.heroSubtitle}>
            只需告诉 AI 您想学什么，即刻获得专业的学习卡片。
            结合间隔重复算法，让您在更短时间内掌握更多知识。
            无论是语言学习、专业考试还是知识积累，都能事半功倍。
          </p>

          <div className={styles.heroCta}>
            <Link href="/auth/signup" className={styles.primaryBtn}>
              🚀 免费开始使用
            </Link>
            <a href="#ai-demo" className={styles.secondaryBtn}>
              👀 观看演示
            </a>
          </div>
        </div>

        {/* AI Feature Highlight Mockup */}
        <div className={styles.heroVisual}>
          <div className={styles.mockup}>
            <div className={styles.mockupHeader}>
              <span className={styles.mockupDot}></span>
              <span className={styles.mockupDot}></span>
              <span className={styles.mockupDot}></span>
            </div>
            <div className={styles.mockupContent}>
              <div className={styles.aiChatPreview}>
                <div className={styles.chatBubbleUser}>
                  帮我生成关于光合作用的学习卡片 🌱
                </div>
                <div className={styles.chatBubbleAi}>
                  <div className={styles.aiThinking}>
                    <span className={styles.aiIcon}>🤖</span>
                    <span>正在分析知识点...</span>
                  </div>
                </div>
                <div className={styles.generatedCards}>
                  <div className={styles.miniCardPreview}>
                    <span className={styles.cardQ}>Q</span>
                    <span>光合作用的主要产物是什么？</span>
                  </div>
                  <div className={styles.miniCardPreview}>
                    <span className={styles.cardQ}>Q</span>
                    <span>叶绿体的作用是什么？</span>
                  </div>
                  <div className={styles.miniCardPreview}>
                    <span className={styles.cardQ}>Q</span>
                    <span>光合作用需要哪些原料？</span>
                  </div>
                </div>
                <div className={styles.cardCount}>✨ 已生成 3 张高质量闪卡</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Demo Section - NEW PROMINENT SECTION */}
      <AIDemo />

      {/* Features Section - Marquee Style */}
      <FeaturesMarquee />

      {/* Benefits Section - 3D Carousel */}
      <BenefitsCarousel />

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            让 AI 助您高效学习
          </h2>
          <p className={styles.ctaSubtitle}>
            加入数千名学习者的行列，体验对话式 AI 闪卡生成。
            完全免费，无需信用卡。
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/auth/signup" className={styles.primaryBtn}>
              🚀 立即免费注册
            </Link>
            <Link href="/auth/login" className={styles.secondaryBtn}>
              已有账号？登录
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>✨</span>
            <span className={styles.footerName}>GeniusFlow-X</span>
          </div>

          <div className={styles.footerLinks}>
            <a href="#ai-demo" className={styles.footerLink}>AI 演示</a>
            <a href="#features" className={styles.footerLink}>功能介绍</a>
            <a href="#benefits" className={styles.footerLink}>产品优势</a>
            <Link href="/auth/login" className={styles.footerLink}>登录</Link>
            <Link href="/auth/signup" className={styles.footerLink}>注册</Link>
          </div>

          <div className={styles.footerCopyright}>
            © {new Date().getFullYear()} GeniusFlow-X. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
