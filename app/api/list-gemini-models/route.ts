import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key yok' }, { status: 500 });
    }

    console.log('📋 Gemini modellerini listeliyorum...');

    // v1 API ile model listesi
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return NextResponse.json({ 
        error: 'Model listesi alınamadı',
        status: response.status,
        details: errorText
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('✅ Modeller alındı:', data.models?.length || 0);

    // generateContent destekleyen modelleri filtrele
    const generateModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent')
    ) || [];

    console.log('🎯 generateContent destekleyen modeller:', generateModels.length);

    return NextResponse.json({
      success: true,
      totalModels: data.models?.length || 0,
      generateContentModels: generateModels.length,
      models: generateModels.map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedMethods: model.supportedGenerationMethods
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Model listesi hatası:', error);
    return NextResponse.json({
      error: 'Model listesi başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}