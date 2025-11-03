import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { seoCities } from '@/lib/cities-seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://itirafpazari.com'
  
  // Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sss`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  try {
    // Get categories for dynamic pages
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('order_index')

    // Get recent posts for dynamic content
    const { data: posts } = await supabase
      .from('posts')
      .select('id, created_at')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .limit(100) // Son 100 post

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories?.map(category => ({
      url: `${baseUrl}/?category=${category.slug}`,
      lastModified: new Date(category.updated_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

    // Post pages (if you have individual post pages)
    const postPages: MetadataRoute.Sitemap = posts?.map(post => ({
      url: `${baseUrl}/post/${post.id}`,
      lastModified: new Date(post.created_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })) || []

    // City pages - SEO için şehir URL'leri
    const cityPages: MetadataRoute.Sitemap = seoCities.map(city => ({
      url: `${baseUrl}/${city.slug}-itiraf`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9, // Şehir sayfaları yüksek öncelik
    }))

    // City filter pages - Ana sayfa şehir filtreleri
    const cityFilterPages: MetadataRoute.Sitemap = seoCities.map(city => ({
      url: `${baseUrl}/?city=${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...categoryPages, ...postPages, ...cityPages, ...cityFilterPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}