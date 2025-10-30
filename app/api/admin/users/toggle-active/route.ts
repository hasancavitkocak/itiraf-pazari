import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { user_id, is_active } = await request.json();

    if (!user_id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'user_id ve is_active gerekli' },
        { status: 400 }
      );
    }

    // Admin yetkisi kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    // Kullanıcının aktif durumunu güncelle
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Kullanıcı ${is_active ? 'aktif' : 'pasif'} edildi`
    });

  } catch (error: any) {
    console.error('Toggle active error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}