import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Service role key ile RLS bypass
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { subject, email, message } = body;

    // Validation - konu ve mesaj zorunlu, email opsiyonel
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'Konu alanı zorunludur' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Mesaj alanı zorunludur' },
        { status: 400 }
      );
    }

    // Insert contact message
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: 'Anonim', // Ad soyad kaldırıldığı için anonim
        email: email?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Contact form error:', error);
      return NextResponse.json(
        { 
          error: 'Mesaj gönderilirken hata oluştu',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
        data 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
