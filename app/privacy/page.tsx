'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>
          
          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Toplanan Bilgiler</h2>
              <p>İtiraf Pazarı olarak, kullanıcılarımızın gizliliğini korumayı taahhüt ediyoruz. Platformumuzda:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>İtiraflar anonim olarak paylaşılır</li>
                <li>IP adresleri güvenlik amaçlı hash'lenerek saklanır</li>
                <li>Email adresleri sadece hesap yönetimi için kullanılır</li>
                <li>Çerezler site deneyimini iyileştirmek için kullanılır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Bilgilerin Kullanımı</h2>
              <p>Toplanan bilgiler şu amaçlarla kullanılır:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Platform güvenliğini sağlamak</li>
                <li>Kullanıcı deneyimini iyileştirmek</li>
                <li>Spam ve kötüye kullanımı önlemek</li>
                <li>Yasal yükümlülükleri yerine getirmek</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Çerezler</h2>
              <p>Sitemizde çerezler kullanılmaktadır. Bu çerezler:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Oturum yönetimi için gereklidir</li>
                <li>Site tercihlerinizi hatırlar</li>
                <li>Google Analytics ile site kullanımını analiz eder</li>
                <li>Reklam gösterimi için kullanılabilir</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Üçüncü Taraf Hizmetler</h2>
              <p>Platformumuzda kullanılan üçüncü taraf hizmetler:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Google AdSense:</strong> Reklam gösterimi</li>
                <li><strong>Google Analytics:</strong> Site analizi</li>
                <li><strong>Supabase:</strong> Veri saklama</li>
                <li><strong>Vercel:</strong> Hosting hizmeti</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Veri Güvenliği</h2>
              <p>Verilerinizin güvenliği için:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>HTTPS şifreleme kullanılır</li>
                <li>Düzenli güvenlik güncellemeleri yapılır</li>
                <li>Erişim kontrolleri uygulanır</li>
                <li>Veri yedekleme sistemleri mevcuttur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. İletişim</h2>
              <p>Gizlilik politikası ile ilgili sorularınız için:</p>
              <p className="mt-2">
                <strong>İletişim Formu:</strong> <a href="/contact" className="text-primary hover:underline">Bize Ulaşın</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Güncellemeler</h2>
              <p>Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler site üzerinden duyurulacaktır.</p>
              <p className="mt-2"><strong>Son Güncelleme:</strong> 24 Ekim 2025</p>
            </section>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}