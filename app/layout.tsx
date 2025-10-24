import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { CookieBanner } from '@/components/cookie-banner';
import Script from 'next/script';

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
      <head>
        {/* AdSense Site Verification Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-3309434924246570" />
        {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID && (
          <>
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
            <Script
              id="adsbygoogle-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: "${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}",
                    enable_page_level_ads: true
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
            <CookieBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
