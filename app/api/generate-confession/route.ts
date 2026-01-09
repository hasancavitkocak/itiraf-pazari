import { NextRequest, NextResponse } from 'next/server';
import { generateConfession } from '@/lib/confession-generator';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // API key kontrolü (güvenlik için)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // İtiraf üret
    const confession = await generateConfession();
    
    // Kategori ID'sini bul
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', confession.metadata.kategori)
      .single();

    if (!categories) {
      return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 400 });
    }

    // IP hash oluştur (bot için sabit)
    const botIpHash = 'bot_generated_content_hash';

    // Veritabanına kaydet
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content: confession.content,
        category_id: categories.id,
        author_id: null, // Bot tarafından oluşturuldu
        author_ip_hash: botIpHash,
        likes_count: 0,
        dislikes_count: 0,
        comments_count: 0,
        reports_count: 0,
        is_hidden: false,
        is_boosted: false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post: post,
      metadata: confession.metadata
    });

  } catch (error) {
    console.error('Generate confession error:', error);
    return NextResponse.json(
      { error: 'İtiraf üretilemedi' }, 
      { status: 500 }
    );
  }
}

// Test için GET endpoint
export async function GET() {
  try {
    const confession = await generateConfession();
    
    return NextResponse.json({
      success: true,
      confession: confession.content,
      metadata: confession.metadata
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test başarısız' }, 
      { status: 500 }
    );
  }
}