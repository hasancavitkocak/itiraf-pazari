import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Toplam kullanıcı sayısı (profiles tablosundan)
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Toplam gönderi sayısı
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    // Toplam yorum sayısı
    const { count: totalComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });

    // Aktif kullanıcı sayısı (is_active = true)
    const { count: activeUsersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_banned', false);

    // Aktif kullanıcılar (son 7 günde gönderi veya yorum yapmış)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activePostUsers } = await supabase
      .from('posts')
      .select('author_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .not('author_id', 'is', null);

    const { data: activeCommentUsers } = await supabase
      .from('comments')
      .select('author_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .not('author_id', 'is', null);

    // Benzersiz aktif kullanıcıları say
    const activeUserIds = new Set([
      ...(activePostUsers?.map(p => p.author_id) || []),
      ...(activeCommentUsers?.map(c => c.author_id) || [])
    ]);
    const activeUsers = activeUserIds.size;

    // Bugünkü istatistikler
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: todayComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Bu haftaki istatistikler
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { count: weekPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString());

    const { count: weekComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString());

    // Gelir istatistikleri
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'completed');

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Bu ayki gelir
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRevenue = payments?.filter(p => 
      new Date(p.created_at) >= monthStart
    ).reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // En popüler kategoriler
    const { data: categoryStats } = await supabase
      .from('posts')
      .select(`
        category_id,
        categories!inner(name, slug)
      `)
      .not('category_id', 'is', null);

    console.log('Category stats raw:', categoryStats);

    const categoryCounts: Record<string, number> = {};
    
    if (categoryStats && categoryStats.length > 0) {
      categoryStats.forEach((post: any) => {
        if (post.categories && post.categories.name) {
          const categoryName = post.categories.name;
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
        }
      });
    }

    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    console.log('Top categories:', topCategories);

    // Gizli/yasaklı içerik istatistikleri
    const { count: hiddenPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('is_hidden', true);

    const { count: bannedUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true);

    // Raporlama istatistikleri
    const { count: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    const { count: pendingReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const response = NextResponse.json({
      stats: {
        // Temel istatistikler
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        activeUsers: activeUsers || 0,
        activeUsersCount: activeUsersCount || 0,
        
        // Günlük istatistikler
        todayPosts: todayPosts || 0,
        todayComments: todayComments || 0,
        
        // Haftalık istatistikler
        weekPosts: weekPosts || 0,
        weekComments: weekComments || 0,
        
        // Gelir istatistikleri
        totalRevenue: totalRevenue.toFixed(2),
        monthlyRevenue: monthlyRevenue.toFixed(2),
        
        // Kategori istatistikleri
        topCategories: topCategories || [],
        
        // Moderasyon istatistikleri
        hiddenPosts: hiddenPosts || 0,
        bannedUsers: bannedUsers || 0,
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
      },
    });

    // Cache'i devre dışı bırak
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
