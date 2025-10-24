import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function extractSupabaseToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  
  for (const cookie of cookies) {
    if (cookie.includes('sb-') && cookie.includes('-auth-token')) {
      const [, value] = cookie.split('=');
      if (value) {
        try {
          const decoded = decodeURIComponent(value);
          const parsed = JSON.parse(decoded);
          return parsed.access_token;
        } catch {
          continue;
        }
      }
    }
  }
  
  return null;
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const accessToken = extractSupabaseToken(cookieHeader);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekli' },
        { status: 403 }
      );
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email ve rol gerekli' },
        { status: 400 }
      );
    }

    if (!['admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { error: 'Geçersiz rol. Sadece admin veya moderator olabilir' },
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
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', targetUser.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      message: `Kullanıcı başarıyla ${role} olarak ayarlandı`,
      email,
      role
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
