// Yasaklı kelimeleri filtreleme utility'si

export interface BadWord {
  id: string;
  word: string;
  created_at: string;
}

// Kelimeyi yıldızlama fonksiyonu
export function censorWord(word: string): string {
  const cleanWord = word.toLowerCase().trim();
  
  if (cleanWord.length <= 2) {
    // 2 harf ve altı: sadece ilk harf
    return cleanWord.charAt(0) + '*'.repeat(cleanWord.length - 1);
  } else if (cleanWord.length === 3) {
    // 3 harf: ilk ve son harf
    return cleanWord.charAt(0) + '*' + cleanWord.charAt(cleanWord.length - 1);
  } else {
    // 4+ harf: ilk ve son harf, ortası yıldız
    return cleanWord.charAt(0) + '*'.repeat(cleanWord.length - 2) + cleanWord.charAt(cleanWord.length - 1);
  }
}

// Metni filtreleme fonksiyonu
export function filterBadWords(text: string, badWords: BadWord[]): string {
  if (!text || !badWords || badWords.length === 0) {
    return text;
  }

  let filteredText = text;
  console.log('Filtering text:', text, 'with', badWords.length, 'bad words');
  
  // Her yasaklı kelime için kontrol et
  badWords.forEach(badWord => {
    const word = badWord.word.toLowerCase();
    
    // Kelime sınırları ile tam eşleşme için regex
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    
    filteredText = filteredText.replace(regex, (match) => {
      // Orijinal kelimenin büyük/küçük harf yapısını koru
      const censored = censorWord(word);
      
      // Orijinal kelimenin case'ini korumaya çalış
      if (match === match.toUpperCase()) {
        return censored.toUpperCase();
      } else if (match === match.toLowerCase()) {
        return censored.toLowerCase();
      } else if (match.charAt(0) === match.charAt(0).toUpperCase()) {
        return censored.charAt(0).toUpperCase() + censored.slice(1);
      }
      
      return censored;
    });
  });

  return filteredText;
}

// Yasaklı kelime kontrolü (sadece kontrol, filtreleme yapmaz)
export function containsBadWords(text: string, badWords: BadWord[]): boolean {
  if (!text || !badWords || badWords.length === 0) {
    return false;
  }

  const lowerText = text.toLowerCase();
  
  return badWords.some(badWord => {
    const word = badWord.word.toLowerCase();
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

// Yasaklı kelimeleri cache'lemek için
let cachedBadWords: BadWord[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 1000; // 30 saniye

export async function getBadWords(): Promise<BadWord[]> {
  const now = Date.now();
  
  // Cache'den döndür eğer fresh ise
  if (cachedBadWords.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedBadWords;
  }

  try {
    // Server-side için direkt Supabase kullan
    if (typeof window === 'undefined') {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: badWords } = await supabase
        .from("bad_words")
        .select("id, word, created_at")
        .order("word");
      
      cachedBadWords = badWords || [];
      lastFetchTime = now;
    } else {
      // Client-side için fetch kullan
      const response = await fetch('/api/bad-words', {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        cachedBadWords = data.badWords || [];
        lastFetchTime = now;
      }
    }
  } catch (error) {
    console.error('Error fetching bad words:', error);
  }

  return cachedBadWords;
}

// Cache'i temizle
export function clearBadWordsCache(): void {
  cachedBadWords = [];
  lastFetchTime = 0;
}

// Cache'i temizlemek için API endpoint
export async function clearCache(): Promise<void> {
  try {
    await fetch('/api/bad-words/clear-cache', {
      method: 'POST'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}