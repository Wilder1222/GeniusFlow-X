import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { AchievementProvider } from "@/lib/contexts/achievement-context";
import { GamificationProvider } from "@/lib/contexts/gamification-context";
import { ToastProvider } from "@/lib/contexts/toast-context";

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Providing all messages to the client
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
                <AuthProvider>
                    <AchievementProvider>
                        <GamificationProvider>
                            <ToastProvider>
                                {children}
                            </ToastProvider>
                        </GamificationProvider>
                    </AchievementProvider>
                </AuthProvider>
            </ThemeProvider>
        </NextIntlClientProvider>
    );
}
