import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCityBySlug, generateCityMeta, seoCities } from '@/lib/cities-seo';
import { CityConfessionPage } from '@/components/city-confession-page';

interface Props {
  params: Promise<{ city: string }>;
}

// Static paths generation for SEO
export async function generateStaticParams() {
  return seoCities.map((city) => ({
    city: city.slug,
  }));
}

// Dynamic metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  
  if (!city) {
    return {
      title: 'Sayfa Bulunamadı | İtiraf Pazarı'
    };
  }

  // Admin'den özel SEO ayarlarını al
  let customMeta = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/seo/cities/${city.id}`);
    if (response.ok) {
      const data = await response.json();
      customMeta = data.settings;
    }
  } catch (error) {
    console.error('Error fetching custom city meta:', error);
  }

  // Özel ayarlar varsa onları kullan, yoksa varsayılanları
  const meta = customMeta || generateCityMeta(city.name);
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords?.split(',') || generateCityMeta(city.name).keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://www.itirafsayfasi.com/${citySlug}-itiraf`,
      siteName: 'İtiraf Pazarı',
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: `https://www.itirafsayfasi.com/${citySlug}-itiraf`,
    },
  };
}

export default async function CityConfessionPageRoute({ params }: Props) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  return <CityConfessionPage city={city} />;
}