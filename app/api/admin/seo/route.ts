import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// SEO ayarlarını getir
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('seo_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Eğer ayar yoksa default değerler döndür
    const defaultSettings = {
      site_title: 'İtiraf Pazarı - Anonim İtiraf Paylaşım Platformu',
      site_description: 'Türkiye\'nin en güvenli anonim itiraf platformu. Kayıt gerektirmez, tamamen ücretsiz.',
      site_keywords: 'itiraf, anonim itiraf, gizli itiraf, türkiye itiraf sitesi',
      google_analytics_id: process.env.NEXT_PUBLIC_GA_ID || '',
      google_search_console_id: '4becba0bddfacfab',
      google_adsense_id: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || '',
      facebook_pixel_id: '',
      twitter_site: '@itirafpazari',
      og_image: '/og-image.jpg',
      robots_txt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth
Disallow: /profile
Sitemap: https://itirafpazari.com/sitemap.xml`,
      canonical_url: 'https://itirafpazari.com',
      schema_org_type: 'WebSite',
      enable_breadcrumbs: true,
      enable_structured_data: true,
      enable_open_graph: true,
      enable_twitter_cards: true,
      meta_author: 'İtiraf Pazarı',
      meta_publisher: 'İtiraf Pazarı',
      language: 'tr-TR',
      region: 'TR',
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      settings: settings || defaultSettings
    })
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json(
      { success: false, error: 'SEO ayarları alınamadı' },
      { status: 500 }
    )
  }
}

// SEO ayarlarını güncelle
export async function POST(request: NextRequest) {
  try {
    // Authorization header'dan token al
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme token\'ı gerekli' },
        { status: 401 }
      )
    }

    // Token ile user bilgisini al
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz yetkilendirme token\'ı' },
        { status: 401 }
      )
    }
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz yetkilendirme' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin yetkisi gerekli' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.site_title || !body.site_description) {
      return NextResponse.json(
        { success: false, error: 'Site başlığı ve açıklaması gerekli' },
        { status: 400 }
      )
    }

    const settingsData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // İlk kayıt var mı kontrol et
    const { data: existingSettings } = await supabase
      .from('seo_settings')
      .select('id')
      .limit(1)
      .single()

    let data, error

    if (existingSettings) {
      // Güncelle
      const result = await supabase
        .from('seo_settings')
        .update(settingsData)
        .eq('id', existingSettings.id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Yeni kayıt ekle
      const result = await supabase
        .from('seo_settings')
        .insert(settingsData)
        .select()
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'SEO ayarları başarıyla güncellendi',
      settings: data
    })
  } catch (error) {
    console.error('Error updating SEO settings:', error)
    return NextResponse.json(
      { success: false, error: 'SEO ayarları güncellenemedi' },
      { status: 500 }
    )
  }
}

// SEO analiz endpoint'i
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'analyze_page':
        return await analyzePage(body.url)
      case 'check_indexing':
        return await checkIndexingStatus()
      case 'generate_sitemap':
        return await generateSitemapStatus()
      case 'validate_structured_data':
        return await validateStructuredData()
      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz aksiyon' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in SEO analysis:', error)
    return NextResponse.json(
      { success: false, error: 'SEO analizi başarısız' },
      { status: 500 }
    )
  }
}

async function analyzePage(url: string) {
  // Sayfa analizi simülasyonu
  const analysis = {
    title: {
      exists: true,
      length: 65,
      optimized: true
    },
    description: {
      exists: true,
      length: 155,
      optimized: true
    },
    headings: {
      h1_count: 1,
      h2_count: 3,
      h3_count: 5
    },
    images: {
      total: 10,
      with_alt: 8,
      without_alt: 2
    },
    links: {
      internal: 15,
      external: 3
    },
    performance: {
      load_time: 2.3,
      mobile_friendly: true,
      https: true
    }
  }

  return NextResponse.json({
    success: true,
    analysis
  })
}

async function checkIndexingStatus() {
  // Google indexing durumu simülasyonu
  const status = {
    total_pages: 156,
    indexed_pages: 142,
    not_indexed: 14,
    last_crawl: new Date().toISOString(),
    sitemap_submitted: true,
    coverage_issues: [
      'Duplicate content detected on 3 pages',
      'Missing meta description on 2 pages'
    ]
  }

  return NextResponse.json({
    success: true,
    indexing_status: status
  })
}

async function generateSitemapStatus() {
  // Sitemap durumu
  const status = {
    last_generated: new Date().toISOString(),
    total_urls: 156,
    categories: 12,
    posts: 134,
    static_pages: 10,
    errors: []
  }

  return NextResponse.json({
    success: true,
    sitemap_status: status
  })
}

async function validateStructuredData() {
  // Structured data validation
  const validation = {
    valid: true,
    schemas_found: [
      'WebSite',
      'Organization',
      'WebApplication',
      'BreadcrumbList'
    ],
    errors: [],
    warnings: [
      'Consider adding more specific schema types for posts'
    ]
  }

  return NextResponse.json({
    success: true,
    structured_data: validation
  })
}