import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // Mevcut modelleri listele
    const models = await genAI.listModels();
    
    return NextResponse.json({
      success: true,
      models: models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description
      }))
    });

  } catch (error) {
    console.error('List models error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}