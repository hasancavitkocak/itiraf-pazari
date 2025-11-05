import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { NewPostForm } from '@/components/new-post-form';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Shield, Users, Zap, Star, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { seoCities } from '@/lib/cities-seo';

export const metadata: Metadata = {
  title: 'Anonim İtiraf Sitesi - Türkiye\'nin En Güvenli İtiraf Platformu | İtiraf Pazarı',
  description: 'Türkiye\'nin en güvenli anonim itiraf sitesi. Aşk, üniversite, iş ve kişisel itiraflarınızı kimliğinizi gizleyerek paylaşın. Kayıt gerektirmez, tamamen ücretsiz. 50+ şehir, 150+ üniversite desteği.',
  keywords: [
    'anonim itiraf sitesi',
    'itiraf sitesi',
    'anonim itiraf',
    'gizli itiraf',
    'itiraf et',
    'anonim hikaye',
    'gizli hikaye',
    'türkiye itiraf sitesi',
    'anonim paylaşım',
    'itiraf platformu',
    'anonim forum',
    'gizli forum',
    'aşk itirafı',
    'üniversite itirafı',
    'iş itirafı',
    'kişisel itiraf',
    'anonim mesaj',
    'gizli mesaj',
    'itiraf oku',
    'itiraf paylaş'
  ],
  openGraph: {
    title: 'Anonim İtiraf Sitesi - Türkiye\'nin En Güvenli İtiraf Platformu',
    description: 'Türkiye\'nin en güvenli anonim itiraf sitesi. Kayıt gerektirmez, tamamen ücretsiz.',
    url: 'https://itirafpazari.com/seo-landing',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itirafpazari.com',
  },
};

const features = [
  {
    icon: Shield,
    title: '100% Anonim',
    description: 'Kimliğiniz tamamen gizli kalır. Kayıt gerektirmez, kişisel bilgi istemez.'
  },
  {
    icon: Users,
    title: '50+ Şehir Desteği',
    description: 'Türkiye\'nin her şehrinden itirafları okuyun ve paylaşın.'
  },
  {
    icon: Zap,
    title: 'Anında Paylaşım',
    description: 'İtirafınızı yazın ve anında yayınlayın. Bekleme yok.'
  },
  {
    icon: Heart,
    title: 'Güvenli Ortam',
    description: 'Moderasyon sistemi ile güvenli ve saygılı bir topluluk.'
  }
];

const categories = [
  { name: 'Aşk İtirafları', count: '2.5K+', color: 'bg-red-100 text-red-700' },
  { name: 'Üniversite İtirafları', count: '1.8K+', color: 'bg-blue-100 text-blue-700' },
  { name: 'İş İtirafları', count: '950+', color: 'bg-green-100 text-green-700' },
  { name: 'Arkadaşlık İtirafları', count: '1.2K+', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Kişisel İtiraflar', count: '3.1K+', color: 'bg-purple-100 text-purple-700' },
];

const testimonials = [
  {
    text: "Yıllardır içimde sakladığım duyguları sonunda paylaşabildim. Çok rahatladım.",
    author: "Anonim Kullanıcı",
    location: "İstanbul"
  },
  {
    text: "Üniversitede yaşadığım zorluklarla ilgili yazdığım itiraf çok destek gördü.",
    author: "Anonim Kullanıcı", 
    location: "Ankara"
  },
  {
    text: "Kimse bilmeyecek diye rahatça paylaşabiliyorum. Harika bir platform.",
    author: "Anonim Kullanıcı",
    location: "İzmir"
  }
];

export default function SEOLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Türkiye'nin En Güvenli
              <br />
              Anonim İtiraf Sitesi
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Aşk, üniversite, iş ve kişisel itiraflarınızı <strong>kimliğinizi gizleyerek</strong> paylaşın. 
              <br />
              Kayıt gerektirmez, tamamen ücretsiz. <strong>50+ şehir</strong> ve <strong>150+ üniversite</strong> desteği.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/">
                <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                  <Heart className="mr-2 h-5 w-5" />
                  İtirafını Paylaş
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  İtirafları Oku
                </Button>
              </Link>
            </div>
            
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>100% Anonim</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Kayıt Gerektirmez</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Tamamen Ücretsiz</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white/50 dark:bg-gray-800/50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Neden İtiraf Pazarı?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Türkiye'nin en güvenli ve kullanıcı dostu anonim itiraf platformu
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <feature.icon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                İtiraf Kategorileri
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Hangi konuda itiraf paylaşmak istiyorsun?
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {categories.map((category, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">Aktif itiraf sayısı</p>
                    </div>
                    <Badge className={category.color}>
                      {category.count}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cities Section */}
        <section className="bg-white/50 dark:bg-gray-800/50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Şehir Bazlı İtiraflar
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Türkiye'nin her şehrinden anonim itiraflar
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {seoCities.slice(0, 24).map((city, index) => (
                <Link key={index} href={`/?city=${encodeURIComponent(city.name)}`}>
                  <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group">
                    <h3 className="font-semibold text-sm group-hover:text-purple-600 transition-colors">{city.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">İtiraflar</p>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Tüm Şehirleri Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Kullanıcılarımız Ne Diyor?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Binlerce kullanıcının güvendiği platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p>{testimonial.location}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hemen İtirafını Paylaş
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Kimliğin gizli kalacak, duygularını rahatça ifade edebileceksin
            </p>
            <Link href="/">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                <Heart className="mr-2 h-5 w-5" />
                İtiraf Et
              </Button>
            </Link>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">
                  Anonim İtiraf Sitesi Nedir?
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    <strong>Anonim itiraf sitesi</strong>, kişilerin kimliklerini gizleyerek 
                    en derin düşüncelerini, duygularını ve deneyimlerini paylaşabildiği 
                    güvenli dijital platformlardır. İtiraf Pazarı, Türkiye'nin en güvenli 
                    ve kullanıcı dostu anonim itiraf sitesidir.
                  </p>
                  
                  <h3 className="text-xl font-semibold mt-8 mb-4">
                    Anonim İtiraf Paylaşmanın Faydaları
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Duygusal Rahatlama:</strong> Bastırılan duyguları dışa vurmak psikolojik rahatlama sağlar</li>
                    <li><strong>Toplumsal Bağ:</strong> Benzer deneyimlere sahip kişilerle empati kurabilirsiniz</li>
                    <li><strong>Kişisel Gelişim:</strong> Deneyimlerinizi paylaşarak kendinizi daha iyi tanıyabilirsiniz</li>
                    <li><strong>Güvenli Ortam:</strong> Kimliğinizi gizleyerek yargılanma korkusu olmadan paylaşım yapabilirsiniz</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mt-8 mb-4">
                    En Popüler İtiraf Konuları
                  </h3>
                  <p>
                    İtiraf Pazarı'nda en çok paylaşılan konular arasında <strong>aşk itirafları</strong>, 
                    <strong>üniversite itirafları</strong>, <strong>iş itirafları</strong> ve 
                    <strong>kişisel deneyimler</strong> yer alıyor. Her kategori, kendine özgü 
                    topluluk dinamikleri ve paylaşım kültürü geliştirmiş durumda.
                  </p>
                  
                  <h3 className="text-xl font-semibold mt-8 mb-4">
                    Güvenlik ve Gizlilik
                  </h3>
                  <p>
                    İtiraf Pazarı, kullanıcılarının güvenliğini ön planda tutar. Hiçbir kişisel 
                    bilgi istenmez, IP adresleri loglanmaz ve tüm paylaşımlar tamamen anonimdir. 
                    Moderasyon sistemi sayesinde uygunsuz içerikler filtrelenir ve güvenli bir 
                    topluluk ortamı sağlanır.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}