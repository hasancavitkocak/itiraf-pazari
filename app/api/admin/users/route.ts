import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin users API called');

    // Service role ile tüm kullanıcıları getir (RLS bypass)
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        username,
        nickname,
        role,
        is_banned,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    // Her kullanıcı için gönderi ve yorum sayısını al
    const usersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        // Gönderi sayısı
        const { count: postsCount } = await supabaseAdmin
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', profile.id);

        // Yorum sayısı
        const { count: commentsCount } = await supabaseAdmin
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', profile.id);

        return {
          ...profile,
          posts_count: postsCount || 0,
          comments_count: commentsCount || 0,
          is_active: profile.is_active ?? true, // Varsayılan olarak aktif
        };
      })
    );

    if (error) {
      console.error('Profiles fetch error:', error);
      throw error;
    }

    console.log('Fetched profiles count:', profiles?.length || 0);

    return NextResponse.json({ 
      users: usersWithStats || [],
      count: usersWithStats?.length || 0
    });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: error.message || 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
