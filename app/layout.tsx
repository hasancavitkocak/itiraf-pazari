import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { CookieBanner } from '@/components/cookie-banner';
import { StructuredData } from '@/components/structured-data';
import { SEOMonitor } from '@/components/seo-monitor';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
    template: '%s | İtiraf Pazarı'
  },
  description: 'Türkiye\'nin en güvenli anonim itiraf platformu. Aşk, iş, okul ve kişisel itiraflarınızı kimliğinizi gizleyerek paylaşın. Kayıt gerektirmez, tamamen ücretsiz.',
  keywords: [
    'itiraf', 'anonim itiraf', 'gizli itiraf', 'aşk itirafı', 'iş itirafı', 
    'okul itirafı', 'anonim paylaşım', 'türkiye itiraf sitesi', 'gizli hikaye', 
    'anonim hikaye', 'itiraf sitesi', 'anonim platform', 'gizli paylaşım',
    'türkiye itiraf', 'anonim forum', 'gizli forum', 'itiraf et', 'anonim mesaj'
  ],
  metadataBase: new URL('https://www.itirafsayfasi.com'),
  authors: [{ name: 'İtiraf Pazarı', url: 'https://itirafpazari.com' }],
  creator: 'İtiraf Pazarı',
  publisher: 'İtiraf Pazarı',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Social Media',
  classification: 'Social Platform',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
    description: 'Türkiye\'nin en güvenli anonim itiraf platformu. Kayıt gerektirmez, tamamen ücretsiz.',
    url: 'https://www.itirafsayfasi.com',
    siteName: 'İtiraf Pazarı',
    type: 'website',
    locale: 'tr_TR',
    images: [
      {
        url: 'https://itirafpazari.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'İtiraf Pazarı - Anonim İtiraf Platformu',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
    description: 'Türkiye\'nin en güvenli anonim itiraf platformu. Kayıt gerektirmez, tamamen ücretsiz.',
    images: ['https://www.itirafsayfasi.com/og-image.jpg'],
    creator: '@itirafpazari',
    site: '@itirafpazari',
  },
  alternates: {
    canonical: 'https://www.itirafsayfasi.com',
    languages: {
      'tr-TR': 'https://www.itirafsayfasi.com',
    },
  },
  verification: {
    google: '4becba0bddfacfab',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'theme-color': '#ffffff',
    'msapplication-TileColor': '#ffffff',
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
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                    anonymize_ip: true,
                    allow_google_signals: false,
                    allow_ad_personalization_signals: false
                  });
                  
                  // Enhanced ecommerce tracking for premium features
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    custom_map: {
                      'custom_parameter_1': 'category',
                      'custom_parameter_2': 'post_type'
                    }
                  });
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
            <SEOMonitor />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
