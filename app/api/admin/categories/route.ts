import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ categories: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü yapılabilir burada
    const body = await request.json();
    const { name, slug, icon, description, is_premium, order_index } = body;

    // Slug benzersizlik kontrolü
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        slug,
        icon,
        description,
        is_premium: is_premium || false,
        order_index: order_index || 1
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ category: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}