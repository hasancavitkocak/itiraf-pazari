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
        role,
        is_premium,
        premium_expires_at,
        is_banned,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Profiles fetch error:', error);
      throw error;
    }

    console.log('Fetched profiles count:', profiles?.length || 0);

    return NextResponse.json({ 
      users: profiles || [],
      count: profiles?.length || 0
    });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: error.message || 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}