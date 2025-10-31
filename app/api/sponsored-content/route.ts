import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache'i devre dışı bırak
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Sponsorlu içerikleri getir (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const limit = parseInt(searchParams.get('limit') || '1');

    let query = supabase
      .from('sponsored_content')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

    // Position filtresi ekle
    if (position === 'top') {
      query = query.eq('position_type', 'top');
    } else if (position === 'mixed' || position === 'between_posts') {
      query = query.eq('position_type', 'mixed');
    }

    const { data: sponsoredContent, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sponsored content:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Hedefleme filtresi uygula
    const filteredContent = sponsoredContent?.filter(content => {
      // Kategori hedeflemesi
      if (content.target_categories && content.target_categories.length > 0) {
        if (!category || !content.target_categories.includes(category)) {
          return false;
        }
      }

      // Şehir hedeflemesi
      if (content.target_cities && content.target_cities.length > 0) {
        if (!city || !content.target_cities.includes(city)) {
          return false;
        }
      }

      return true;
    }) || [];

    // Sadece ilk sonucu döndür (tek reklam)
    const content = filteredContent.length > 0 ? filteredContent[0] : null;

    return NextResponse.json({ 
      content,
      total: filteredContent.length 
    });

  } catch (error) {
    console.error('Sponsored content API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Yeni sponsorlu içerik oluştur (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Admin kontrolü
    const { data: profile } = await supabase
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