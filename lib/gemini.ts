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
      short: 'kısa (80-120 kelime)',
      medium: 'orta (120-180 kelime)', 
      long: 'uzun (180-250 kelime)'
    };

    // Settings'den custom prompt'u al
    let customPrompt = '';
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'ai_confession_prompt')
        .single();
      
      customPrompt = data?.setting_value || '';
    } catch (error) {
      // Settings alınamazsa varsayılan prompt kullan
    }

    // Eğer custom prompt varsa onu kullan, yoksa varsayılan
    const prompt = customPrompt ? 
      customPrompt
        .replace('{category}', category)
        .replace('{mood}', moodPrompts[mood])
        .replace('{length}', lengthGuides[length])
      :
      `Sen Türk üniversite öğrencilerinin günlük hayatından gerçekçi itiraflar yazan bir asistansın.

YAZIM TARZI:
- Günlük konuşma dili kullan (ama argo yok)
- Samimi ve içten ol
- Gerçekçi detaylar ekle
- Duygusal ol ama abartma
- Kısa cümleler, akıcı anlatım

KONU ÖRNEKLERİ:
- Gizli aşklar, reddedilme hikayeleri
- Utanç verici anılar, komik durumlar  
- Aile sorunları, arkadaşlık dramları
- Sınav stresi, gelecek kaygısı
- Para sıkıntısı, yurt hayatı
- İlk öpücük, ilişki deneyimleri
- Pişmanlıklar, özlemler
- Gizli hobiler, tutkular

KURALLARI:
- ${lengthGuides[length]} yaz
- İsim, okul, şehir belirtme
- Kişisel bilgi verme
- Sadece itiraf metnini yaz
- Başlık ekleme

Kategori: ${category}
Ton: ${moodPrompts[mood]}

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