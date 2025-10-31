import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache'i devre dışı bırak
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Admin - Tüm sponsorlu içerikleri getir
export async function GET(request: NextRequest) {
  try {
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

    const { data: sponsoredContent, error } = await adminSupabase
      .from('sponsored_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sponsored content:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      sponsoredContent: sponsoredContent || []
    });

  } catch (error) {
    console.error('Admin sponsored content API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin - Yeni sponsorlu içerik oluştur
export async function POST(request: NextRequest) {
  try {
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
      end_date
    } = body;

    if (!title || !link_url) {
      return NextResponse.json({ 
        error: 'Title and link URL are required' 
      }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from('sponsored_content')
      .insert({
        title,
        description: description || null,
        link_url,
        button_text: button_text || 'Siteyi Ziyaret Et',
        author_name: author_name || 'anonymous',
        position_type: position_type || 'mixed',
        fixed_position: fixed_position || null,
        mix_frequency: mix_frequency || 5,
        target_categories: target_categories || null,
        target_cities: target_cities || null,
        start_date: start_date || new Date().toISOString(),
        end_date: end_date && end_date.trim() !== '' ? end_date : null,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sponsored content:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      sponsoredContent: data 
    }, { status: 201 });

  } catch (error) {
    console.error('Create sponsored content error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}