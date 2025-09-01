import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { TranslationProvider } from '@/components/providers/TranslationProvider';
import { FirestoreSyncProvider } from '@/components/providers/FirestoreSyncProvider';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Titanium Tunisia Open - Compétition de Pêche',
  description: 'Système officiel de gestion de tournoi pour la compétition de pêche Titanium Tunisia Open',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0891b2' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tunisia Open',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Titanium Tunisia Open - Compétition de Pêche',
    description: 'Système officiel de gestion de tournoi pour la compétition de pêche Titanium Tunisia Open',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = savedTheme || systemTheme;
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <ThemeProvider>
            <SocketProvider>
              <TranslationProvider>
                <FirestoreSyncProvider>
                  {children}
                </FirestoreSyncProvider>
              </TranslationProvider>
            </SocketProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}