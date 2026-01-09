import { NextRequest, NextResponse } from 'next/server';
import { generateConfession } from '@/lib/confession-generator';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // API key kontrolü
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Şu anki saat (Türkiye saati)
    const now = new Date();
    const currentTime = now.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });

    console.log(`🕐 Cron job çalışıyor: ${currentTime}`);

    // Aktif schedule'ları veritabanından al
    const { data: schedules, error: schedulesError } = await supabase
      .from('cron_schedules')
      .select('*')
      .eq('is_active', true)
      .eq('time', currentTime);

    if (schedulesError) {
      console.error('❌ Schedule'lar alınamadı:', schedulesError);
      return NextResponse.json({ error: 'Schedule\'lar alınamadı' }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      console.log(`⏰ ${currentTime} için aktif schedule bulunamadı`);
      return NextResponse.json({ 
        message: 'Bu saat için aktif schedule yok',
        currentTime,
        timestamp: new Date().toISOString()
      });
    }

    const results = [];

    // Her aktif schedule için itiraf oluştur
    for (const schedule of schedules) {
      try {
        console.log(`✨ ${schedule.label} için itiraf oluşturuluyor...`);

        // Kategori belirtilmişse kullan, yoksa rastgele
        const confessionParams = schedule.category ? { kategori: schedule.category } : undefined;
        
        // İtiraf üret
        const confession = await generateConfession(confessionParams);
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
            scheduled_time: currentTime,
            schedule_id: schedule.id,
            schedule_label: schedule.label,
            status: 'failed',
            error_message: errorMsg
          });

          results.push({
            schedule: schedule.label,
            status: 'failed',
            error: errorMsg
          });
          continue;
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
            scheduled_time: currentTime,
            schedule_id: schedule.id,
            schedule_label: schedule.label,
            status: 'failed',
            error_message: errorMsg
          });

          results.push({
            schedule: schedule.label,
            status: 'failed',
            error: errorMsg
          });
          continue;
        }

        // Başarı logunu kaydet
        await logConfession({
          confession_content: confession.content,
          category: confession.metadata.kategori,
          location: `${confession.metadata.il}, ${confession.metadata.ilce}`,
          metadata: confession.metadata,
          scheduled_time: currentTime,
          schedule_id: schedule.id,
          schedule_label: schedule.label,
          status: 'success'
        });

        const successMsg = `✅ ${schedule.label} başarıyla yayınlandı!`;
        console.log(successMsg);
        console.log(`📍 Konum: ${confession.metadata.il}, ${confession.metadata.ilce}`);
        console.log(`👤 Profil: ${confession.metadata.yas} yaş, ${confession.metadata.meslek}, ${confession.metadata.cinsiyet}`);
        console.log(`📝 Kategori: ${categories.name} (${confession.metadata.kategori})`);
        console.log(`🆔 Post ID: ${post.id}`);

        results.push({
          schedule: schedule.label,
          status: 'success',
          post: {
            id: post.id,
            content: confession.content,
            category: categories.name
          },
          metadata: confession.metadata
        });

      } catch (error) {
        const errorMsg = `${schedule.label} için beklenmeyen hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`;
        console.error(`💥 ${errorMsg}`, error);
        
        // Hata logunu kaydet
        await logConfession({
          confession_content: '',
          category: schedule.category || 'unknown',
          location: 'unknown',
          metadata: {},
          scheduled_time: currentTime,
          schedule_id: schedule.id,
          schedule_label: schedule.label,
          status: 'failed',
          error_message: errorMsg
        });

        results.push({
          schedule: schedule.label,
          status: 'failed',
          error: errorMsg
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${currentTime} için ${schedules.length} schedule işlendi`,
      currentTime,
      results,
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

// Log kaydetme fonksiyonu
async function logConfession(logData: any) {
  try {
    console.log('📊 CONFESSION LOG:', {
      time: logData.scheduled_time,
      schedule: logData.schedule_label,
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
        metadata: {
          ...logData.metadata,
          schedule_id: logData.schedule_id,
          schedule_label: logData.schedule_label
        },
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
  try {
    // Aktif schedule'ları getir
    const { data: schedules } = await supabase
      .from('cron_schedules')
      .select('*')
      .eq('is_active', true)
      .order('time', { ascending: true });

    const now = new Date();
    const currentTime = now.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });

    return NextResponse.json({
      message: 'Dinamik Cron Job Test Endpoint',
      currentTime,
      activeSchedules: schedules?.length || 0,
      schedules: schedules || [],
      timezone: 'Europe/Istanbul',
      timestamp: now.toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test endpoint hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}