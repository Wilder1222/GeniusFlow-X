import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { AchievementProvider } from "@/lib/contexts/achievement-context";
import { GamificationProvider } from "@/lib/contexts/gamification-context";
import ErrorBoundary from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "GeniusFlow-X - AI-Powered Flashcard App",
  description: "Modern flashcard app with AI-powered card generation and spaced repetition",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <AchievementProvider>
                <GamificationProvider>
                  {children}
                </GamificationProvider>
              </AchievementProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
