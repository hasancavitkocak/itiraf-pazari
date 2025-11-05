import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { seoCities } from '@/lib/cities-seo';

interface CityPageProps {
  params: {
    city: string;
  };
}

// Generate static params for all cities
export async function generateStaticParams() {
  return seoCities.map((city) => ({
    city: city.slug,
  }));
}

// Generate metadata for each city
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  if (!params?.city) {
    return {
      title: 'Sayfa Bulunamadı | İtiraf Pazarı',
    };
  }
  
  const citySlug = params.city.replace('-itiraf', '');
  const city = seoCities.find(c => c.slug === citySlug);
  
  if (!city) {
    return {
      title: 'Sayfa Bulunamadı | İtiraf Pazarı',
    };
  }

  const title = `${city.name} İtiraf - Anonim ${city.name} İtirafları | İtiraf Pazarı`;
  const description = `${city.name} şehrinden anonim itiraflar. ${city.name} üniversite, aşk, iş ve kişisel itiraflarını oku. Kimliğini gizleyerek sen de itirafını paylaş.`;

  return {
    title,
    description,
    keywords: [
      `${city.name} itiraf`,
      `${city.name} anonim itiraf`,
      `${city.name} üniversite itiraf`,
      `${city.name} aşk itirafı`,
      `${city.name} gizli itiraf`,
      `${city.name} itiraf sitesi`,
      `${city.name} hikaye`,
      `${city.name} anonim hikaye`,
      'anonim itiraf',
      'gizli itiraf',
      'itiraf et'
    ],
    openGraph: {
      title,
      description,
      url: `https://itirafpazari.com/${city.slug}-itiraf`,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'İtiraf Pazarı',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://itirafpazari.com/${city.slug}-itiraf`,
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  if (!params?.city) {
    notFound();
  }
  
  const citySlug = params.city.replace('-itiraf', '');
  const city = seoCities.find(c => c.slug === citySlug);
  
  if (!city) {
    notFound();
  }

  // Server-side redirect ile ana sayfaya yönlendir ve şehir filtresini uygula
  redirect(`/?city=${encodeURIComponent(city.name)}`);
}