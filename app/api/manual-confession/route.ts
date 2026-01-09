import { NextRequest, NextResponse } from 'next/server';
import { generateConfession } from '@/lib/confession-generator';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Manuel itiraf yayınlama testi...');

    // İtiraf üret
    const confession = await generateConfession();
    console.log(`✨ İtiraf üretildi: ${confession.metadata.kategori} kategorisinde`);

    // Kategori ID'sini bul
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', confession.metadata.kategori)
      .single();

    if (!categories) {
      const errorMsg = `Kategori bulunamadı: ${confession.metadata.kategori}`;
      console.error(`❌ ${errorMsg}`);
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Bot IP hash
    const botIpHash = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Veritabanına kaydet
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content: confession.content,
        category_id: categories.id,
        author_id: null,
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
      const errorMsg = `Veritabanı hatası: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    const successMsg = `✅ Manuel itiraf başarıyla yayınlandı!`;
    console.log(successMsg);
    console.log(`📍 Konum: ${confession.metadata.il}, ${confession.metadata.ilce}`);
    console.log(`👤 Profil: ${confession.metadata.yas} yaş, ${confession.metadata.meslek}, ${confession.metadata.cinsiyet}`);
    console.log(`📝 Kategori: ${categories.name} (${confession.metadata.kategori})`);
    console.log(`🆔 Post ID: ${post.id}`);

    return NextResponse.json({
      success: true,
      message: successMsg,
      post: {
        id: post.id,
        content: confession.content,
        category: categories.name
      },
      metadata: confession.metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMsg = `Beklenmeyen hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`;
    console.error(`💥 ${errorMsg}`, error);
    
    return NextResponse.json({ 
      error: errorMsg,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// GET ile de test edebilmek için
export async function GET() {
  return NextResponse.json({
    message: 'Manuel itiraf yayınlama endpoint\'i',
    usage: 'POST request gönderin',
    timestamp: new Date().toISOString()
  });
}