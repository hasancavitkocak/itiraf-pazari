import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { CookieBanner } from '@/components/cookie-banner';
import { StructuredData } from '@/components/structured-data';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
  description: 'Türkiye\'nin en güvenli anonim itiraf platformu. Aşk, iş, okul ve kişisel itiraflarınızı kimliğinizi gizleyerek paylaşın. Kayıt gerektirmez, tamamen ücretsiz.',
  keywords: 'itiraf, anonim itiraf, gizli itiraf, aşk itirafı, iş itirafı, okul itirafı, anonim paylaşım, türkiye itiraf sitesi, gizli hikaye, anonim hikaye',
  metadataBase: new URL('https://itirafpazari.com'),
  authors: [{ name: 'İtiraf Pazarı' }],
  creator: 'İtiraf Pazarı',
  publisher: 'İtiraf Pazarı',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
    description: 'Türkiye\'nin en güvenli anonim itiraf platformu. Kayıt gerektirmez, tamamen ücretsiz.',
    url: 'https://itirafpazari.com',
    siteName: 'İtiraf Pazarı',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
    description: 'Türkiye\'nin en güvenli anonim itiraf platformu. Kayıt gerektirmez, tamamen ücretsiz.',
  },
  alternates: {
    canonical: 'https://itirafpazari.com',
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
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="4becba0bddfacfab" />
        
        {/* AdSense Site Verification Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-3309434924246570" />
        
        {/* Structured Data */}
        <StructuredData />
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Google AdSense */}
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
