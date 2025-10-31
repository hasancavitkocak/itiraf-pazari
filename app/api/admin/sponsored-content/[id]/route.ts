import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin - Sponsorlu içeriği güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Admin kontrolü
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      link_url,
      button_text,
      author_name,
      position_type,
      fixed_position,
      mix_frequency,
      target_categories,
      target_cities,
      start_date,
      end_date,
      is_active
    } = body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (link_url !== undefined) updateData.link_url = link_url;
    if (button_text !== undefined) updateData.button_text = button_text;
    if (author_name !== undefined) updateData.author_name = author_name;
    if (position_type !== undefined) updateData.position_type = position_type;
    if (fixed_position !== undefined) updateData.fixed_position = fixed_position;
    if (mix_frequency !== undefined) updateData.mix_frequency = mix_frequency;
    if (target_categories !== undefined) updateData.target_categories = target_categories;
    if (target_cities !== undefined) updateData.target_cities = target_cities;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date && end_date.trim() !== '' ? end_date : null;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await adminSupabase
      .from('sponsored_content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sponsored content:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      sponsoredContent: data 
    });

  } catch (error) {
    console.error('Update sponsored content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin - Sponsorlu içeriği sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Admin kontrolü
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { error } = await adminSupabase
      .from('sponsored_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sponsored content:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Sponsorlu içerik silindi'
    });

  } catch (error) {
    console.error('Delete sponsored content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
