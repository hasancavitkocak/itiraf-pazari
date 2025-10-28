// SEO için şehir listesi ve URL mapping
export const seoCities = [
  { slug: 'istanbul', name: 'İstanbul', id: 34 },
  { slug: 'ankara', name: 'Ankara', id: 6 },
  { slug: 'izmir', name: 'İzmir', id: 35 },
  { slug: 'bursa', name: 'Bursa', id: 16 },
  { slug: 'antalya', name: 'Antalya', id: 7 },
  { slug: 'adana', name: 'Adana', id: 1 },
  { slug: 'konya', name: 'Konya', id: 42 },
  { slug: 'gaziantep', name: 'Gaziantep', id: 27 },
  { slug: 'kayseri', name: 'Kayseri', id: 38 },
  { slug: 'mersin', name: 'Mersin', id: 33 },
  { slug: 'eskisehir', name: 'Eskişehir', id: 26 },
  { slug: 'diyarbakir', name: 'Diyarbakır', id: 21 },
  { slug: 'samsun', name: 'Samsun', id: 55 },
  { slug: 'denizli', name: 'Denizli', id: 20 },
  { slug: 'sanliurfa', name: 'Şanlıurfa', id: 63 },
  { slug: 'adapazari', name: 'Adapazarı', id: 54 },
  { slug: 'malatya', name: 'Malatya', id: 44 },
  { slug: 'kahramanmaras', name: 'Kahramanmaraş', id: 46 },
  { slug: 'erzurum', name: 'Erzurum', id: 25 },
  { slug: 'van', name: 'Van', id: 65 }
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