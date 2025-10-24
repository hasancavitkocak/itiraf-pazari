import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Admin yetkisi ile istatistikleri getir
    const { data: users } = await supabase.auth.admin.listUsers();
    const totalUsers = users.users.length;

    const { count: totalPosts } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const { count: premiumUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPosts: postsCount || 0,
        totalRevenue: totalRevenue.toFixed(2),
        activeUsers: premiumUsers || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
