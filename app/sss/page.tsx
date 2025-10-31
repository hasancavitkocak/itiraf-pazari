import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SSSStructuredData } from '@/components/sss-structured-data';
import { SSSContent } from '@/components/sss-content';
import { Metadata } from 'next';

// SEO metadata
export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular (SSS) | İtiraf Pazarı',
  description: 'İtiraf Pazarı hakkında merak ettiğiniz tüm soruların cevapları. Anonim itiraf paylaşımı, güvenlik, premium üyelik ve daha fazlası.',
  keywords: ['sss', 'sıkça sorulan sorular', 'itiraf pazarı yardım', 'anonim itiraf nasıl', 'güvenlik', 'premium üyelik'],
  openGraph: {
    title: 'Sıkça Sorulan Sorular | İtiraf Pazarı',
    description: 'İtiraf Pazarı hakkında merak ettiğiniz tüm soruların cevapları.',
    url: 'https://www.itirafpazari.com/sss',
  },
};



export default function SSS() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SSSStructuredData />
      <Header />
      <SSSContent />
      <Footer />
    </div>
  );
}
