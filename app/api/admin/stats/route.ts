import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Service role ile bağlan
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Bugünkü itiraflar
    const today = new Date().toISOString().split('T')[0];
    const { data: todayPosts, error: todayError } = await supabase
      .from('posts')
      .select('id')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    // Toplam itiraflar
    const { data: totalPosts, error: totalError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true });

    // Bot itirafları (author_id null olanlar)
    const { data: botPosts, error: botError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .is('author_id', null);

    // Bugünkü loglar
    const { data: todayLogs, error: logsError } = await supabaseAdmin
      .from('confession_logs')
      .select('status')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    // Kategorilere göre dağılım
    const { data: categoryStats, error: categoryError } = await supabase
      .from('posts')
      .select(`
        category_id,
        categories!inner(name, slug)
      `)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (todayError || totalError || botError || logsError || categoryError) {
      console.error('Stats hatası:', { todayError, totalError, botError, logsError, categoryError });
      return NextResponse.json({ error: 'İstatistikler alınamadı' }, { status: 500 });
    }

    // Kategori istatistiklerini hesapla
    const categoryCount: Record<string, number> = {};
    categoryStats?.forEach(post => {
      const categoryName = (post.categories as any)?.name || 'Bilinmeyen';
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });

    // Log istatistikleri
    const successLogs = todayLogs?.filter(log => log.status === 'success').length || 0;
    const failedLogs = todayLogs?.filter(log => log.status === 'failed').length || 0;

    return NextResponse.json({
      success: true,
      stats: {
        today: {
          totalPosts: todayPosts?.length || 0,
          successfulCrons: successLogs,
          failedCrons: failedLogs,
          categoryBreakdown: categoryCount
        },
        overall: {
          totalPosts: totalPosts?.length || 0,
          botPosts: botPosts?.length || 0,
          userPosts: (totalPosts?.length || 0) - (botPosts?.length || 0)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin stats hatası:', error);
    return NextResponse.json({ 
      error: 'Beklenmeyen hata',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}