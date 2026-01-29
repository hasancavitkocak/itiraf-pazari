import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ConfessionRequest {
  category?: string;
  mood?: 'funny' | 'serious' | 'romantic' | 'dramatic' | 'random';
  length?: 'short' | 'medium' | 'long';
}

export async function generateConfession(options: ConfessionRequest = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const { category = 'genel', mood = 'random', length = 'medium' } = options;

    const moodPrompts = {
      funny: 'komik ve eğlenceli',
      serious: 'ciddi ve düşündürücü', 
      romantic: 'romantik ve duygusal',
      dramatic: 'dramatik ve etkileyici',
      random: 'çeşitli tonlarda'
    };

    const lengthGuides = {
      short: '50-100 kelime arası kısa',
      medium: '100-200 kelime arası orta uzunlukta', 
      long: '200-300 kelime arası uzun'
    };

    const prompt = `
Türk üniversite öğrencilerinin yaşayabileceği gerçekçi bir itiraf yazısı oluştur.

Kategori: ${category}
Ton: ${moodPrompts[mood]}
Uzunluk: ${lengthGuides[length]}

Kurallar:
- Gerçekçi ve samimi olsun
- Üniversite hayatından olsun
- Türkçe günlük konuşma dili kullan
- Kişisel ve duygusal olsun
- Argo kullanma, nezaketli ol
- İsim, okul adı gibi kişisel bilgiler verme
- Sadece itiraf metnini yaz, başlık veya açıklama ekleme

Örnek konular: aşk, arkadaşlık, aile, sınav stresi, gelecek kaygısı, utanç verici anılar, gizli tutkular, pişmanlıklar, hayaller

İtiraf:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const confession = response.text().trim();

    // Temizlik kontrolü
    if (confession.length < 20 || confession.length > 1000) {
      throw new Error('Generated confession length is invalid');
    }

    return {
      success: true,
      confession,
      metadata: {
        category,
        mood,
        length,
        wordCount: confession.split(' ').length
      }
    };

  } catch (error) {
    // Güvenlik: API key'i loglama
    return {
      success: false,
      error: 'AI service temporarily unavailable',
      confession: null
    };
  }
}

export async function generateConfessionTitle(confession: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `
Bu itiraf için kısa ve çekici bir başlık oluştur:

"${confession}"

Kurallar:
- Maksimum 8 kelime
- Merak uyandırıcı olsun
- Spoiler verme
- Türkçe olsun
- Sadece başlığı yaz

Başlık:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const title = response.text().trim().replace(/"/g, '');

    return {
      success: true,
      title
    };

  } catch (error) {
    // Güvenlik: Hata detaylarını loglama
    return {
      success: false,
      title: 'İtiraf'
    };
  }
}