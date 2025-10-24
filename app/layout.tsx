import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
  description: 'Anonim olarak itiraflarınızı paylaşın ve diğer insanların hikayelerini keşfedin. Güvenli ve gizli ortamda duygularınızı ifade edin.',
  keywords: 'itiraf, anonim, paylaşım, aşk, iş, okul, gizli, platform',
  metadataBase: new URL('https://itirafpazari.com'),
  openGraph: {
    title: 'İtiraf Pazarı',
    description: 'Anonim olarak itiraflarınızı paylaşın',
    url: 'https://itirafpazari.com',
    siteName: 'İtiraf Pazarı',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İtiraf Pazarı',
    description: 'Anonim olarak itiraflarınızı paylaşın',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
