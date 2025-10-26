import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://itirafpazari.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth', '/premium', '/profile'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}