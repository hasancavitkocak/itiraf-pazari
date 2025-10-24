import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Authorization header'dan token al
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Geçersiz oturum' },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    const { username } = await request.json();

    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: 'Kullanıcı adı en az 3 karakter olmalı' },
        { status: 400 }
      );
    }

    // Kullanıcı adının benzersiz olup olmadığını kontrol et
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .neq('id', user.id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Kullanıcı adını güncelle
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        username: username.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ 
      message: 'Kullanıcı adı güncellendi',
      username: username.trim()
    });
  } catch (error: any) {
    console.error('Update username error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}