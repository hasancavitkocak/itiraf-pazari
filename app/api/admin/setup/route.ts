import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, secret } = await request.json();

    if (!email || !secret) {
      return NextResponse.json(
        { error: 'Email ve güvenlik anahtarı gerekli' },
        { status: 400 }
      );
    }

    const adminSetupSecret = process.env.ADMIN_SETUP_SECRET || 'change-this-secret-key-in-production';

    if (secret !== adminSetupSecret) {
      return NextResponse.json(
        { error: 'Geçersiz güvenlik anahtarı' },
        { status: 403 }
      );
    }

    const { data: existingAdmins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Sistemde zaten admin kullanıcı var. Lütfen mevcut admin ile giriş yapın.' },
        { status: 400 }
      );
    }

    const { data: users } = await supabase.auth.admin.listUsers();
    const targetUser = users.users.find(u => u.email === email);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin', updated_at: new Date().toISOString() })
      .eq('id', targetUser.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      message: 'İlk admin kullanıcısı başarıyla oluşturuldu',
      email
    });
  } catch (error: any) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
