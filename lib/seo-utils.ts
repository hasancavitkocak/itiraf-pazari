import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  category?: string
}

export function generateSEO({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  category
}: SEOProps): Metadata {
  const baseUrl = 'https://www.itirafpazari.com'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullTitle = title ? `${title} | İtiraf Pazarı` : 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu'
  const defaultDescription = 'Türkiye\'nin en güvenli anonim itiraf platformu. Kayıt gerektirmez, tamamen ücretsiz.'
  const metaDescription = description || defaultDescription

  const defaultKeywords = [
    'itiraf', 'anonim itiraf', 'gizli itiraf', 'türkiye itiraf sitesi',
    'anonim paylaşım', 'gizli hikaye', 'itiraf sitesi'
  ]

  return {
    title: fullTitle,
    description: metaDescription,
    keywords: [...defaultKeywords, ...keywords],
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: fullUrl,
      siteName: 'İtiraf Pazarı',
      type,
      locale: 'tr_TR',
      images: [
        {
          url: `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        }
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section: category,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [`${baseUrl}${image}`],
      creator: '@itirafpazari',
      site: '@itirafpazari',
    },
    alternates: {
      canonical: fullUrl,
    },
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
  }
}

// Slug oluşturma fonksiyonu
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Anahtar kelime yoğunluğu hesaplama
export function calculateKeywordDensity(text: string, keyword: string): number {
  const words = text.toLowerCase().split(/\s+/)
  const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length
  return (keywordCount / words.length) * 100
}

// Meta description optimize etme
export function optimizeMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text
  
  const truncated = text.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
}

// Structured data oluşturma
export function generateArticleStructuredData({
  title,
  description,
  url,
  publishedTime,
  modifiedTime,
  author = 'İtiraf Pazarı',
  category,
  image = '/og-image.jpg'
}: {
  title: string
  description: string
  url: string
  publishedTime: string
  modifiedTime?: string
  author?: string
  category?: string
  image?: string
}) {
  const baseUrl = 'https://www.itirafpazari.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: `${baseUrl}${url}`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'İtiraf Pazarı',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    image: {
      '@type': 'ImageObject',
      url: `${baseUrl}${image}`,
      width: 1200,
      height: 630,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}${url}`,
    },
    ...(category && {
      articleSection: category,
    }),
  }
}

// Breadcrumb structured data
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const baseUrl = 'https://www.itirafpazari.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}
