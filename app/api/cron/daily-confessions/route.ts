import { NextRequest, NextResponse } from 'next/server';
import { generateConfession } from '@/lib/confession-generator';
import { supabase } from '@/lib/supabase';

// Günlük itiraf zamanları (Türkiye saati - günde 10 itiraf)
const DAILY_SCHEDULE = [
  { time: '07:00', label: 'Sabah Erken İtirafı' },
  { time: '09:00', label: 'Sabah İtirafı' },
  { time: '11:00', label: 'Öğleden Önce İtirafı' },
  { time: '13:00', label: 'Öğle İtirafı' },
  { time: '15:00', label: 'Öğleden Sonra İtirafı' },
  { time: '17:00', label: 'Akşam İtirafı' },
  { time: '19:00', label: 'Akşam Geç İtirafı' },
  { time: '21:00', label: 'Gece İtirafı' },
  { time: '23:00', label: 'Gece Geç İtirafı' },
  { time: '01:00', label: 'Gece Yarısı İtirafı' }
];

// Log tablosu için tip
interface ConfessionLog {
  id?: string;
  confession_content: string;
  category: string;
  location: string;
  metadata: any;
  scheduled_time: string;
  created_at?: string;
  status: 'success' | 'failed';
  error_message?: string;
}

export async function POST(request: NextRequest) {
  try {
    // API key kontrolü
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Şu anki saat
    const now = new Date();
    const currentTime = now.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });

    // Hangi zaman diliminde olduğumuzu bul
    const currentSchedule = DAILY_SCHEDULE.find(schedule => 
      schedule.time === currentTime
    );

    if (!currentSchedule) {
      return NextResponse.json({ 
        error: 'Bu saat için planlanmış itiraf yok',
        currentTime,
        schedule: DAILY_SCHEDULE
      }, { status: 400 });
    }

    console.log(`🕐 ${currentSchedule.label} başlatılıyor... (${currentTime})`);

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
      
      // Hata logunu kaydet
      await logConfession({
        confession_content: confession.content,
        category: confession.metadata.kategori,
        location: `${confession.metadata.il}, ${confession.metadata.ilce}`,
        metadata: confession.metadata,
        scheduled_time: currentSchedule.time,
        status: 'failed',
        error_message: errorMsg
      });

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
      
      // Hata logunu kaydet
      await logConfession({
        confession_content: confession.content,
        category: confession.metadata.kategori,
        location: `${confession.metadata.il}, ${confession.metadata.ilce}`,
        metadata: confession.metadata,
        scheduled_time: currentSchedule.time,
        status: 'failed',
        error_message: errorMsg
      });

      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    // Başarı logunu kaydet
    await logConfession({
      confession_content: confession.content,
      category: confession.metadata.kategori,
      location: `${confession.metadata.il}, ${confession.metadata.ilce}`,
      metadata: confession.metadata,
      scheduled_time: currentSchedule.time,
      status: 'success'
    });

    const successMsg = `✅ ${currentSchedule.label} başarıyla yayınlandı!`;
    console.log(successMsg);
    console.log(`📍 Konum: ${confession.metadata.il}, ${confession.metadata.ilce}`);
    console.log(`👤 Profil: ${confession.metadata.yas} yaş, ${confession.metadata.meslek}, ${confession.metadata.cinsiyet}`);
    console.log(`📝 Kategori: ${categories.name} (${confession.metadata.kategori})`);
    console.log(`🆔 Post ID: ${post.id}`);

    return NextResponse.json({
      success: true,
      message: successMsg,
      schedule: currentSchedule,
      post: {
        id: post.id,
        content: confession.content,
        category: categories.name
      },
      metadata: confession.metadata,
      timestamp: now.toISOString()
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

// Log kaydetme fonksiyonu
async function logConfession(logData: ConfessionLog) {
  try {
    // Console log
    console.log('📊 CONFESSION LOG:', {
      time: logData.scheduled_time,
      status: logData.status,
      category: logData.category,
      location: logData.location,
      error: logData.error_message || 'none',
      timestamp: new Date().toISOString()
    });
    
    // Supabase'e kaydet (service role ile)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('confession_logs')
      .insert({
        confession_content: logData.confession_content,
        category: logData.category,
        location: logData.location,
        metadata: logData.metadata,
        scheduled_time: logData.scheduled_time,
        status: logData.status,
        error_message: logData.error_message
      });

    if (error) {
      console.error('❌ Log veritabanına kaydedilemedi:', error);
    } else {
      console.log('✅ Log veritabanına kaydedildi');
    }
    
  } catch (error) {
    console.error('💥 Log kaydedilemedi:', error);
  }
}

// Manuel test için GET endpoint
export async function GET() {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Istanbul'
  });

  return NextResponse.json({
    message: 'Cron Job Test Endpoint',
    currentTime,
    schedule: DAILY_SCHEDULE,
    timezone: 'Europe/Istanbul',
    timestamp: now.toISOString()
  });
}