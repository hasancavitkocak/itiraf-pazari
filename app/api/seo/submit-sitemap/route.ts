import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Google Search Console'a sitemap gönderme
    const sitemapUrl = 'https://itirafpazari.com/sitemap.xml';
    const googleUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    // Google'a ping gönder
    const response = await fetch(googleUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Bot/1.0)',
      },
    });

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Sitemap Google\'a başarıyla gönderildi' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Sitemap gönderilirken hata oluştu' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Sitemap gönderme hatası:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Sitemap gönderilirken hata oluştu' 
    }, { status: 500 });
  }
}

// Bing için de sitemap gönderme
export async function PUT(request: NextRequest) {
  try {
    const sitemapUrl = 'https://itirafpazari.com/sitemap.xml';
    const bingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    const response = await fetch(bingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Bot/1.0)',
      },
    });

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Sitemap Bing\'e başarıyla gönderildi' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Sitemap gönderilirken hata oluştu' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Bing sitemap gönderme hatası:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Sitemap gönderilirken hata oluştu' 
    }, { status: 500 });
  }
}