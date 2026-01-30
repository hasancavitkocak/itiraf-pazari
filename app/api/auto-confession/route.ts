import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateConfession } from '@/lib/gemini';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rastgele kategoriler ve mood'lar
const confessionMoods = ['funny', 'serious', 'romantic', 'dramatic', 'random'] as const;
const confessionLengths = ['short', 'medium', 'long'] as const;

export async function POST(request: NextRequest) {
  try {
    // Güvenlik kontrolü
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rastgele kategori seç
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .order('order_index', { ascending: true });
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'No categories found' }, { status: 400 });
    }
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Rastgele şehir seç - tüm şehirlerden
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name');
    
    console.log('Cities fetched:', cities?.length, 'Error:', citiesError);
    
    let randomCity = null;
    
    if (cities && cities.length > 0) {
      // JavaScript ile rastgele seçim
      randomCity = cities[Math.floor(Math.random() * cities.length)];
      console.log('Selected city:', randomCity);
    }
    
    // Rastgele mood ve length seç
    const randomMood = confessionMoods[Math.floor(Math.random() * confessionMoods.length)];
    const randomLength = confessionLengths[Math.floor(Math.random() * confessionLengths.length)];

    // Gemini ile itiraf oluştur
    const confessionResult = await generateConfession({
      category: randomCategory.name,
      mood: randomMood,
      length: randomLength
    });

    if (!confessionResult.success || !confessionResult.confession) {
      return NextResponse.json({ 
        error: 'Failed to generate confession',
        details: confessionResult.error 
      }, { status: 500 });
    }

    // Otomatik itiraf kaydet
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        content: confessionResult.confession,
        category_id: randomCategory.id,
        city_id: randomCity?.id || null,
        district_id: null, // İlçe kullanmıyoruz artık
        author_ip_hash: 'auto_generated_' + Date.now(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create confession' }, { status: 500 });
    }

    // Log kaydet (hata olursa devam et)
    try {
      await supabase
        .from('confession_logs')
        .insert({
          action: 'auto_confession_created',
          details: { 
            post_id: post.id, 
            category: randomCategory.name,
            city: randomCity?.name || null,
            district: null, // İlçe kullanmıyoruz
            mood: randomMood,
            length: randomLength,
            word_count: confessionResult.metadata?.wordCount,
            confession_content: confessionResult.confession // İtiraf içeriğini ekle
          },
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      // Log hatası önemli değil, devam et
    }

    return NextResponse.json({ 
      success: true, 
      post_id: post.id,
      category: randomCategory.name,
      city: randomCity?.name || 'Belirtilmemiş',
      district: null, // İlçe kullanmıyoruz artık
      mood: randomMood,
      length: randomLength,
      word_count: confessionResult.metadata?.wordCount
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}