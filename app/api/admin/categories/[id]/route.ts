import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;
    const { name, slug, icon, description, is_premium, order_index } = body;

    // Slug benzersizlik kontrolü (kendisi hariç)
    const { data: existingCategory } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      slug,
      icon,
      is_premium,
      order_index
    };

    // Description alanı varsa ekle
    if (description !== undefined) {
      updateData.description = description;
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ category: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Kategoriye ait gönderi var mı kontrol et
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (posts && posts.length > 0) {
      return NextResponse.json(
        { error: 'Bu kategoriye ait gönderiler var. Önce gönderileri silin veya başka kategoriye taşıyın.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}