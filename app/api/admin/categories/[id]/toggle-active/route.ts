import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { is_active } = body;
    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    console.log('Toggle active request:', {
      categoryId,
      is_active,
      body,
      params
    });

    if (!categoryId || typeof is_active !== 'boolean') {
      console.log('Validation failed:', {
        categoryId: !!categoryId,
        is_active_type: typeof is_active,
        is_active_value: is_active
      });
      
      return NextResponse.json(
        { error: 'Category ID ve is_active gerekli', debug: { categoryId, is_active, body } },
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

    // Kategorinin aktif durumunu güncelle (Admin client ile RLS bypass)
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ 
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select('*')
      .single();

    console.log('Update result:', { data, error });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Kategori ${is_active ? 'aktif' : 'pasif'} edildi`
    });

  } catch (error: any) {
    console.error('Toggle category active error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}