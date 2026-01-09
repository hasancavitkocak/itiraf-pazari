import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY bulunamadı' }, { status: 500 });
    }

    console.log('🔍 Mevcut modeller listeleniyor...');

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Basit bir test - bilinen model adları
    const testModels = [
      "gemini-pro",
      "gemini-1.5-pro", 
      "gemini-1.5-flash",
      "models/gemini-pro",
      "models/gemini-1.5-pro",
      "models/gemini-1.5-flash"
    ];

    const results = [];

    for (const modelName of testModels) {
      try {
        console.log(`🧪 Test ediliyor: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Test");
        const response = await result.response;
        const text = response.text();
        
        results.push({
          model: modelName,
          status: 'success',
          response: text.substring(0, 50) + '...'
        });
        
        console.log(`✅ Çalışıyor: ${modelName}`);
        break; // İlk çalışanı bulduk, dur
        
      } catch (error) {
        results.push({
          model: modelName,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
        console.log(`❌ Çalışmıyor: ${modelName}`);
      }
    }

    return NextResponse.json({
      success: true,
      results: results,
      workingModel: results.find(r => r.status === 'success')?.model || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Model listesi alınamadı:', error);
    return NextResponse.json({
      error: 'Model listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}