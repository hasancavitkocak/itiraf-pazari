import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Service role key ile RLS bypass
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { name, subject, message } = body;

    // Validation
    if (!name || !subject || !message) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    // Insert contact message
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: null, // Email alanını null bırak
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