// SEO için şehir listesi ve URL mapping (veritabanındaki gerçek ID'ler)
export const seoCities = [
  { slug: 'istanbul', name: 'İstanbul', id: 82 },
  { slug: 'ankara', name: 'Ankara', id: 83 },
  { slug: 'izmir', name: 'İzmir', id: 35 }, // Veritabanında kontrol edilmeli
  { slug: 'bursa', name: 'Bursa', id: 85 },
  { slug: 'antalya', name: 'Antalya', id: 86 },
  { slug: 'adana', name: 'Adana', id: 87 },
  { slug: 'konya', name: 'Konya', id: 42 }, // Veritabanında kontrol edilmeli
  { slug: 'gaziantep', name: 'Gaziantep', id: 89 },
  { slug: 'kayseri', name: 'Kayseri', id: 38 }, // Veritabanında kontrol edilmeli
  { slug: 'mersin', name: 'Mersin', id: 33 }, // Veritabanında kontrol edilmeli
  { slug: 'eskisehir', name: 'Eskişehir', id: 131 },
  { slug: 'diyarbakir', name: 'Diyarbakır', id: 93 },
  { slug: 'samsun', name: 'Samsun', id: 55 }, // Veritabanında kontrol edilmeli
  { slug: 'denizli', name: 'Denizli', id: 105 },
  { slug: 'sanliurfa', name: 'Şanlıurfa', id: 63 }, // Veritabanında kontrol edilmeli
  { slug: 'adapazari', name: 'Adapazarı', id: 54 }, // Veritabanında kontrol edilmeli
  { slug: 'malatya', name: 'Malatya', id: 44 }, // Veritabanında kontrol edilmeli
  { slug: 'kahramanmaras', name: 'Kahramanmaraş', id: 46 }, // Veritabanında kontrol edilmeli
  { slug: 'erzurum', name: 'Erzurum', id: 110 },
  { slug: 'van', name: 'Van', id: 65 } // Veritabanında kontrol edilmeli
];

export function getCityBySlug(slug: string) {
  return seoCities.find(city => city.slug === slug);
}

export function generateCityMeta(cityName: string) {
  return {
    title: `${cityName} İtirafları | İtiraf Pazarı`,
    description: `${cityName}'dan anonim itiraflar. ${cityName} şehrinden gerçek hikayeler, deneyimler ve itiraflar. Tamamen anonim ve güvenli.`,
    keywords: [
      `${cityName} itiraf`,
      `${cityName} anonim itiraf`,
      `${cityName} hikaye`,
      `${cityName} deneyim`,
      `${cityName} şehir itirafları`,
      'anonim paylaşım',
      'gizli itiraf'
    ]
  };
}
