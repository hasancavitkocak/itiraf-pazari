import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ 
  model: "models/gemini-2.5-flash",
  generationConfig: {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 800, // 1500'den 800'e düşürdük (300 karakter için yeterli)
  },
});

// Türkiye'nin illeri ve ilçeleri
export const turkishCities = [
  { il: 'İstanbul', ilceler: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Üsküdar', 'Bakırköy', 'Fatih'] },
  { il: 'Ankara', ilceler: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Sincan', 'Etimesgut'] },
  { il: 'İzmir', ilceler: ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Gaziemir'] },
  { il: 'Bursa', ilceler: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik'] },
  { il: 'Antalya', ilceler: ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Aksu', 'Döşemealtı'] },
  { il: 'Adana', ilceler: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam'] },
  { il: 'Konya', ilceler: ['Meram', 'Karatay', 'Selçuklu'] },
  { il: 'Gaziantep', ilceler: ['Şahinbey', 'Şehitkamil', 'Oğuzeli'] },
  { il: 'Mersin', ilceler: ['Mezitli', 'Yenişehir', 'Toroslar', 'Akdeniz'] },
  { il: 'Kayseri', ilceler: ['Melikgazi', 'Kocasinan', 'Talas'] }
];

// İtiraf kategorileri (Supabase slug'larıyla eşleşen)
export const confessionCategories = [
  'ask', 'arkadaslik', 'aile', 'is', 'okul', 'cinsellik', 'kayip-esya', 'havadan-sudan', 'gizli'
];

// Yaş grupları
export const ageGroups = ['18-25', '26-35', '36-45', '46+'];

// Meslekler
export const professions = [
  'öğrenci', 'mühendis', 'öğretmen', 'doktor', 'hemşire', 'avukat', 'muhasebeci', 
  'satış danışmanı', 'pazarlama uzmanı', 'grafik tasarımcı', 'yazılımcı', 'işçi', 
  'memur', 'esnaf', 'ev hanımı', 'emekli'
];

// Rastgele seçim fonksiyonları
export const getRandomCity = () => {
  const city = turkishCities[Math.floor(Math.random() * turkishCities.length)];
  const district = city.ilceler[Math.floor(Math.random() * city.ilceler.length)];
  return { il: city.il, ilce: district };
};

export const getRandomCategory = () => {
  return confessionCategories[Math.floor(Math.random() * confessionCategories.length)];
};

export const getRandomAge = () => {
  return ageGroups[Math.floor(Math.random() * ageGroups.length)];
};

export const getRandomProfession = () => {
  return professions[Math.floor(Math.random() * professions.length)];
};

export const getRandomGender = () => {
  return Math.random() > 0.5 ? 'erkek' : 'kadın';
};