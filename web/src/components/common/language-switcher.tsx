'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing, Locale } from '@/i18n/routing';
import styles from './language-switcher.module.css';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: Locale) => {
        if (newLocale === locale) return;

        // Replace the locale in the current path
        const segments = pathname.split('/');
        if (segments[1] && routing.locales.includes(segments[1] as Locale)) {
            segments[1] = newLocale;
        } else {
            segments.splice(1, 0, newLocale);
        }

        router.push(segments.join('/'));
    };

    return (
        <div className={styles.switcher}>
            {routing.locales.map((l) => (
                <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={`${styles.localeBtn} ${l === locale ? styles.active : ''}`}
                    aria-label={`Switch to ${l === 'en' ? 'English' : '中文'}`}
                >
                    {l === 'en' ? 'EN' : 'ZH'}
                </button>
            ))}
        </div>
    );
}

export default LanguageSwitcher;
