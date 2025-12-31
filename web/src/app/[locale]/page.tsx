'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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
import LanguageSwitcher from '@/components/common/language-switcher';
import { useAuth } from '@/lib/auth-context';
import styles from './page.module.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const t = useTranslations('Landing');
  const tCommon = useTranslations('Common');

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
          {user && <Link href="/home" className={styles.navLink}>{t('nav.home')}</Link>}
          <a href="#ai-demo" className={styles.navLink}>{t('nav.aiDemo')}</a>
          <a href="#features" className={styles.navLink}>{t('nav.features')}</a>
          <a href="#benefits" className={styles.navLink}>{t('nav.benefits')}</a>
        </div>

        <div className={styles.navActions}>
          <LanguageSwitcher />
          {loading ? (
            <span className={styles.loadingText}>{tCommon('loading')}</span>
          ) : user ? (
            <UserSettingsPanel />
          ) : (
            <>
              <Link href="/auth/login" className={styles.loginBtn}>{t('nav.login')}</Link>
              <Link href="/auth/signup" className={styles.signupBtn}>{t('nav.signup')}</Link>
            </>
          )}
        </div>

        <button className={styles.mobileMenuBtn} aria-label={t('nav.menu')}>
          <span className={styles.mobileMenuIcon}></span>
        </button>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.badge}>
            <span className={styles.badgeEmoji}>🤖</span>
            <span>{t('hero.badge')}</span>
          </span>

          <h1 className={styles.heroTitle}>
            {t('hero.title')}<br />
            <span className={styles.gradient}>{t('hero.titleHighlight')}</span>
          </h1>

          <p className={styles.heroSubtitle}>
            {t('hero.subtitle')}
          </p>

          <div className={styles.heroCta}>
            <Link href="/auth/signup" className={styles.primaryBtn}>
              {t('hero.cta')}
            </Link>
            <a href="#ai-demo" className={styles.secondaryBtn}>
              {t('hero.demo')}
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
                  {t('mockup.userChat')}
                </div>
                <div className={styles.chatBubbleAi}>
                  <div className={styles.aiThinking}>
                    <span className={styles.aiIcon}>🤖</span>
                    <span>{t('mockup.aiThinking')}</span>
                  </div>
                </div>
                <div className={styles.generatedCards}>
                  <div className={styles.miniCardPreview}>
                    <span className={styles.cardQ}>Q</span>
                    <span>{t('mockup.q1')}</span>
                  </div>
                  <div className={styles.miniCardPreview}>
                    <span className={styles.cardQ}>Q</span>
                    <span>{t('mockup.q2')}</span>
                  </div>
                  <div className={styles.miniCardPreview}>
                    <span className={styles.cardQ}>Q</span>
                    <span>{t('mockup.q3')}</span>
                  </div>
                </div>
                <div className={styles.cardCount}>{t('mockup.cardCount')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Demo Section */}
      <AIDemo />

      {/* Features Section */}
      <FeaturesMarquee />

      {/* Benefits Section */}
      <BenefitsCarousel />

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            {t('cta.title')}
          </h2>
          <p className={styles.ctaSubtitle}>
            {t('cta.subtitle')}
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/auth/signup" className={styles.primaryBtn}>
              {t('cta.signup')}
            </Link>
            <Link href="/auth/login" className={styles.secondaryBtn}>
              {t('cta.login')}
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
            <a href="#ai-demo" className={styles.footerLink}>{t('nav.aiDemo')}</a>
            <a href="#features" className={styles.footerLink}>{t('footer.features')}</a>
            <a href="#benefits" className={styles.footerLink}>{t('footer.benefits')}</a>
            <Link href="/auth/login" className={styles.footerLink}>{t('nav.login')}</Link>
            <Link href="/auth/signup" className={styles.footerLink}>{t('nav.signup')}</Link>
          </div>

          <div className={styles.footerCopyright}>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  );
}
