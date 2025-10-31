import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Verify user with supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Geçersiz oturum' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nickname } = body;

    if (!nickname || !nickname.trim()) {
      return NextResponse.json(
        { error: 'Kullanıcı adı boş olamaz' },
        { status: 400 }
      );
    }

    // Nickname format kontrolü
    const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!nicknameRegex.test(nickname)) {
      return NextResponse.json(
        { error: 'Kullanıcı adı 3-20 karakter olmalı ve sadece harf, rakam, alt çizgi içermelidir' },
        { status: 400 }
      );
    }

    // Nickname benzersizlik kontrolü
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('nickname', nickname.trim())
      .neq('id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Nickname güncelle
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ nickname: nickname.trim() })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Kullanıcı adı güncellenirken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı adı başarıyla güncellendi'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
