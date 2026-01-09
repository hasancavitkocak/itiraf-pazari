import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY bulunamadı' }, { status: 500 });
    }

    console.log('🔑 API Key mevcut:', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Basit bir test
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    
    const result = await model.generateContent("Merhaba, nasılsın?");
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      apiKeyExists: !!apiKey,
      testResponse: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini test hatası:', error);
    return NextResponse.json({
      error: 'Gemini test başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      apiKeyExists: !!process.env.GEMINI_API_KEY
    }, { status: 500 });
  }
}