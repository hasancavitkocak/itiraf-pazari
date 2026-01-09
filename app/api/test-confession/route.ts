import { NextRequest, NextResponse } from 'next/server';
import { generateConfession } from '@/lib/confession-generator';

export async function GET() {
  try {
    console.log('🧪 Test itirafı üretiliyor...');
    
    const confession = await generateConfession();
    
    console.log('✅ Test başarılı!');
    console.log(`📍 Konum: ${confession.metadata.il}, ${confession.metadata.ilce}`);
    console.log(`👤 Profil: ${confession.metadata.yas} yaş, ${confession.metadata.meslek}, ${confession.metadata.cinsiyet}`);
    console.log(`📝 Kategori: ${confession.metadata.kategori}`);
    console.log(`💬 İçerik: ${confession.content.substring(0, 100)}...`);

    return NextResponse.json({
      success: true,
      confession: confession.content,
      metadata: confession.metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test başarısız:', error);
    return NextResponse.json(
      { 
        error: 'Test başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🧪 Özel parametrelerle test itirafı üretiliyor...');
    
    const confession = await generateConfession(body);
    
    console.log('✅ Özel test başarılı!');
    console.log(`📍 Konum: ${confession.metadata.il}, ${confession.metadata.ilce}`);
    console.log(`👤 Profil: ${confession.metadata.yas} yaş, ${confession.metadata.meslek}, ${confession.metadata.cinsiyet}`);
    console.log(`📝 Kategori: ${confession.metadata.kategori}`);

    return NextResponse.json({
      success: true,
      confession: confession.content,
      metadata: confession.metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Özel test başarısız:', error);
    return NextResponse.json(
      { 
        error: 'Özel test başarısız',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      }, 
      { status: 500 }
    );
  }
}