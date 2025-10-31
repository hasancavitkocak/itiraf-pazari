'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Kullanım Şartları</h1>
          
          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Genel Kurallar</h2>
              <p>İtiraf Pazarı platformunu kullanarak aşağıdaki kurallara uymayı kabul ediyorsunuz:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Yasal olmayan içerik paylaşmayacaksınız</li>
                <li>Başkalarının haklarını ihlal etmeyeceksiniz</li>
                <li>Spam veya zararlı içerik paylaşmayacaksınız</li>
                <li>Platform güvenliğini tehdit etmeyeceksiniz</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. İçerik Kuralları</h2>
              <p>Paylaştığınız itiraflar:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Gerçek kişilerin özel bilgilerini içermemelidir</li>
                <li>Nefret söylemi barındırmamalıdır</li>
                <li>Şiddet içerikli olmamalıdır</li>
                <li>Telif hakkı ihlali yapmamalıdır</li>
                <li>Yasal olmayan aktiviteleri teşvik etmemelidir</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Hesap Sorumluluğu</h2>
              <p>Kullanıcı hesabınız için:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Güvenli şifre kullanmakla yükümlüsünüz</li>
                <li>Hesabınızın kötüye kullanımından sorumlusunuz</li>
                <li>Şüpheli aktiviteleri bildirmelisiniz</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Yasaklı Davranışlar</h2>
              <p>Aşağıdaki davranışlar kesinlikle yasaktır:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Sahte hesap oluşturma</li>
                <li>Sistem güvenliğini test etme</li>
                <li>Otomatik bot kullanımı</li>
                <li>Diğer kullanıcıları taciz etme</li>
                <li>Platform kurallarını ihlal etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. İçerik Moderasyonu</h2>
              <p>Platform yönetimi:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>İçerikleri moderasyon hakkına sahiptir</li>
                <li>Kurallara aykırı içerikleri kaldırabilir</li>
                <li>Kullanıcı hesaplarını askıya alabilir</li>
                <li>Gerektiğinde yasal işlem başlatabilir</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Sorumluluk Reddi</h2>
              <p>İtiraf Pazarı:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Kullanıcı içeriklerinden sorumlu değildir</li>
                <li>Hizmet kesintilerinden sorumlu tutulamaz</li>
                <li>Üçüncü taraf bağlantılardan sorumlu değildir</li>
                <li>Veri kaybı riskini kabul etmezsiniz</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Değişiklikler</h2>
              <p>Bu kullanım şartları önceden haber verilmeksizin güncellenebilir. Güncellemeler site üzerinden duyurulacaktır.</p>
              <p className="mt-2"><strong>Son Güncelleme:</strong> 24 Ekim 2025</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. İletişim</h2>
              <p>Kullanım şartları ile ilgili sorularınız için:</p>
              <p className="mt-2">
                <strong>İletişim Formu:</strong> <a href="/contact" className="text-primary hover:underline">Bize Ulaşın</a>
              </p>
            </section>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
