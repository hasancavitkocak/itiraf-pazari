import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key yok' }, { status: 500 });
    }

    console.log('🧪 Manuel Gemini testi...');

    // Yeni v1 API endpoint'i
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        parts: [{
          text: "Merhaba, nasılsın? Kısa bir cevap ver."
        }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return NextResponse.json({ 
        error: 'Gemini API hatası',
        status: response.status,
        details: errorText
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('✅ Success! Response:', data);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Cevap alınamadı';

    return NextResponse.json({
      success: true,
      response: text,
      fullData: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Manuel test hatası:', error);
    return NextResponse.json({
      error: 'Manuel test başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}