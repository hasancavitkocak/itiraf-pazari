import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Heart, MessageCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'Blog - İtiraf Rehberi ve İpuçları | İtiraf Pazarı',
  description: 'Anonim itiraf paylaşımı hakkında rehberler, ipuçları ve en popüler itiraf hikayeleri. Güvenli itiraf paylaşımının püf noktalarını öğren.',
  keywords: [
    'itiraf rehberi',
    'anonim itiraf nasıl paylaşılır',
    'itiraf ipuçları',
    'güvenli itiraf',
    'itiraf hikayeleri',
    'anonim paylaşım rehberi',
    'itiraf yazma teknikleri',
    'gizli itiraf',
    'anonim hikaye'
  ],
  openGraph: {
    title: 'Blog - İtiraf Rehberi ve İpuçları | İtiraf Pazarı',
    description: 'Anonim itiraf paylaşımı hakkında rehberler, ipuçları ve en popüler itiraf hikayeleri.',
    url: 'https://itirafpazari.com/blog',
    type: 'website',
  },
  alternates: {
    canonical: 'https://itirafpazari.com/blog',
  },
};

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Static fallback data (will be replaced by database data)
const fallbackBlogPosts = [
  {
    id: 1,
    title: 'Anonim İtiraf Nasıl Paylaşılır? Kapsamlı Rehber',
    excerpt: 'Güvenli ve etkili bir şekilde anonim itiraf paylaşmanın püf noktalarını öğrenin. Kimliğinizi koruyarak duygularınızı ifade etmenin yolları.',
    content: `
      <h2>Anonim İtiraf Paylaşımının Temelleri</h2>
      <p>Anonim itiraf paylaşımı, modern dijital çağda duygusal rahatlama ve toplumsal bağ kurmanın önemli bir yoludur. Bu rehberde, güvenli ve etkili itiraf paylaşımının inceliklerini keşfedeceğiz. Psikolojik araştırmalar gösteriyor ki, duygularını ifade eden kişiler daha sağlıklı bir ruh haline sahip oluyor ve stres seviyelerinde belirgin azalma yaşıyor.</p>
      
      <h3>1. Doğru Platform Seçimi</h3>
      <p>İtiraf paylaşırken en önemli faktör, güvenilir bir platform seçmektir. İtiraf Pazarı gibi özel olarak bu amaç için tasarlanmış platformlar, anonimliğinizi korurken toplulukla bağ kurmanızı sağlar. Platform seçerken dikkat edilmesi gereken faktörler:</p>
      <ul>
        <li><strong>Güvenlik Protokolleri:</strong> SSL sertifikası, veri şifreleme ve güvenli sunucular</li>
        <li><strong>Moderasyon Sistemi:</strong> Uygunsuz içeriklerin filtrelenmesi</li>
        <li><strong>Kullanıcı Gizliliği:</strong> IP adresi loglanmaması, kişisel veri toplanmaması</li>
        <li><strong>Topluluk Kuralları:</strong> Net ve adil kullanım şartları</li>
      </ul>
      
      <h3>2. Kişisel Bilgileri Koruma</h3>
      <p>Anonimliğinizi korumak için dikkat etmeniz gereken en kritik nokta, kişisel bilgilerinizi asla paylaşmamanızdır. Bu sadece isim ve adres gibi açık bilgileri değil, sizi dolaylı yoldan tanımlayabilecek detayları da kapsar:</p>
      <ul>
        <li><strong>Doğrudan Tanımlayıcılar:</strong> Gerçek isim, telefon numarası, e-posta adresi, ev/iş adresi</li>
        <li><strong>Dolaylı Tanımlayıcılar:</strong> Çok spesifik tarihler, nadir hastalıklar, benzersiz deneyimler</li>
        <li><strong>Sosyal Medya Bağlantıları:</strong> Instagram, Twitter gibi hesap bilgileri</li>
        <li><strong>Coğrafi Detaylar:</strong> Mahalle isimleri, spesifik mekan isimleri</li>
      </ul>
      
      <h3>3. Etkili İtiraf Yazma Teknikleri</h3>
      <p>İyi bir itiraf, okuyucuyla duygusal bağ kurar ve samimi bir hikaye anlatır. Araştırmalar gösteriyor ki, en çok okunan itiraflar belirli yapısal özelliklere sahip. İşte etkili itiraf yazmanın detaylı ipuçları:</p>
      
      <h4>Hikaye Anlatım Teknikleri:</h4>
      <ul>
        <li><strong>Giriş Kısmı:</strong> Okuyucunun dikkatini çekecek güçlü bir başlangıç yapın</li>
        <li><strong>Gelişme:</strong> Olayları kronolojik sırayla, detaylarla anlatın</li>
        <li><strong>Doruk Noktası:</strong> En yoğun duygusal anı vurgulayın</li>
        <li><strong>Sonuç:</strong> Deneyiminizden çıkardığınız dersi paylaşın</li>
      </ul>
      
      <h4>Duygusal Bağ Kurma:</h4>
      <ul>
        <li><strong>Samimi Dil:</strong> Gerçek duygularınızı açık bir şekilde ifade edin</li>
        <li><strong>Evrensel Temalar:</strong> Herkesin yaşayabileceği duygulara odaklanın</li>
        <li><strong>Detay Dengesi:</strong> Çok az detay sıkıcı, çok fazla detay kimlik ifşası riski</li>
      </ul>
      
      <h3>4. Topluluk Kurallarına Uyum</h3>
      <p>Her platformun kendine özgü kuralları vardır ve bu kurallara uymak hem sizin hem de diğer kullanıcıların güvenliğini sağlar. İtiraf Pazarı'nda dikkat edilmesi gereken temel kurallar:</p>
      <ul>
        <li><strong>Saygılı Dil:</strong> Küfür, hakaret ve aşağılayıcı ifadeler yasak</li>
        <li><strong>Yasal Sınırlar:</strong> Suç teşkil eden içerikler paylaşılamaz</li>
        <li><strong>Spam Yasağı:</strong> Aynı içeriği tekrar tekrar paylaşmak yasak</li>
        <li><strong>Reklam Yasağı:</strong> Ticari amaçlı paylaşımlar yapılamaz</li>
      </ul>
      
      <h3>5. Duygusal Hazırlık ve Sonrası</h3>
      <p>İtiraf paylaşmak duygusal olarak zorlayıcı olabilir. Kendinizi hazırlayın ve gerekirse profesyonel destek alın. İtiraf paylaşımı öncesi ve sonrası dikkat edilmesi gerekenler:</p>
      
      <h4>Paylaşım Öncesi:</h4>
      <ul>
        <li>Duygusal olarak hazır olduğunuzdan emin olun</li>
        <li>Paylaşacağınız içeriği bir kez daha gözden geçirin</li>
        <li>Olası tepkilere karşı mental olarak hazırlanın</li>
      </ul>
      
      <h4>Paylaşım Sonrası:</h4>
      <ul>
        <li>Gelen yorumları okurken duygusal sınırlarınızı koruyun</li>
        <li>Olumsuz tepkileri kişisel algılamayın</li>
        <li>Gerekirse platformdan bir süre uzaklaşın</li>
      </ul>
      
      <h3>6. Psikolojik Faydalar</h3>
      <p>Anonim itiraf paylaşımının bilimsel olarak kanıtlanmış psikolojik faydaları vardır:</p>
      <ul>
        <li><strong>Katarsis Etkisi:</strong> Bastırılan duyguların dışa vurulması</li>
        <li><strong>Sosyal Destek:</strong> Benzer deneyimlere sahip kişilerle bağ kurma</li>
        <li><strong>Öz-Kabul:</strong> Kendi deneyimlerini kabul etme süreci</li>
        <li><strong>Stres Azaltma:</strong> Duygusal yükün hafiflemesi</li>
      </ul>
      
      <h3>Sonuç</h3>
      <p>Anonim itiraf paylaşımı, doğru yaklaşımla hem kişisel gelişim hem de toplumsal bağ kurma açısından son derece faydalıdır. Bu rehberdeki ipuçlarını takip ederek, güvenli ve etkili bir itiraf deneyimi yaşayabilirsiniz. Unutmayın, her itiraf bir cesaret gösterisidir ve sizi daha güçlü kılar.</p>
    `,
    category: 'Rehber',
    readTime: '12 dk',
    publishDate: '2025-11-05',
    views: 1250,
    likes: 89,
    comments: 23,
    slug: 'anonim-itiraf-nasil-paylasilir'
  },
  {
    id: 2,
    title: 'Üniversite İtirafları: En Popüler Konular ve Trendler',
    excerpt: 'Üniversite öğrencilerinin en çok paylaştığı itiraf konuları ve bu hikayelerin arkasındaki psikolojik faktörler.',
    content: `
      <h2>Üniversite Döneminin İtiraf Dinamikleri</h2>
      <p>Üniversite yılları, gençlerin kimlik arayışı içinde oldukları ve yoğun duygusal deneyimler yaşadıkları bir dönemdir. Bu dönemde paylaşılan itiraflar, genç yetişkinlerin iç dünyasına dair önemli ipuçları verir. 18-25 yaş arası gençlerin %78'i bu dönemde en az bir kez anonim itiraf paylaşma ihtiyacı hissettiğini belirtiyor.</p>
      
      <h3>En Popüler Üniversite İtiraf Konuları</h3>
      <p>2024 yılı verilerine göre, üniversite öğrencilerinin paylaştığı itirafların dağılımı şu şekilde:</p>
      
      <h4>1. Aşk ve İlişkiler (%35)</h4>
      <p>Üniversite öğrencilerinin en çok paylaştığı itiraflar aşk ve ilişki konularında. Bu kategoride öne çıkan alt konular:</p>
      <ul>
        <li><strong>İlk Aşk Deneyimleri:</strong> Üniversitede yaşanan ilk ciddi ilişkiler</li>
        <li><strong>Platonik Aşklar:</strong> Hocalar, sınıf arkadaşları veya kampüsteki kişilere duyulan gizli aşklar</li>
        <li><strong>Uzun Mesafe İlişkileri:</strong> Farklı şehirlerde okuyan çiftlerin zorlukları</li>
        <li><strong>Kalp Kırıklıkları:</strong> İlk büyük ayrılık deneyimleri</li>
        <li><strong>Cinsel Deneyimler:</strong> İlk cinsel deneyimler ve keşifler</li>
      </ul>
      
      <h4>2. Akademik Stres ve Başarı Kaygısı (%28)</h4>
      <p>Akademik hayatın getirdiği baskılar, öğrencilerin en çok itiraf ettiği konulardan biri:</p>
      <ul>
        <li><strong>Sınav Kaygısı:</strong> Final ve vize dönemlerindeki yoğun stres</li>
        <li><strong>Not Endişesi:</strong> GPA düşüklüğü ve mezuniyet korkuları</li>
        <li><strong>Kopya Çekme:</strong> Akademik dürüstlükle ilgili iç çelişkiler</li>
        <li><strong>Bölüm Memnuniyetsizliği:</strong> Yanlış tercih yapma pişmanlığı</li>
        <li><strong>Gelecek Korkusu:</strong> Mezuniyet sonrası iş bulma endişesi</li>
      </ul>
      
      <h4>3. Sosyal Kaygılar ve Arkadaşlık (%22)</h4>
      <p>Sosyal hayata uyum sağlama zorluğu, birçok öğrencinin yaşadığı ortak bir deneyim:</p>
      <ul>
        <li><strong>Arkadaş Edinme Zorluğu:</strong> Yeni ortama uyum sağlayamama</li>
        <li><strong>Sosyal Fobi:</strong> Kalabalık ortamlarda kendini ifade edememe</li>
        <li><strong>Yalnızlık Hissi:</strong> Kampüste yalnız kalma korkusu</li>
        <li><strong>Grup Dinamikleri:</strong> Arkadaş gruplarına dahil olamama</li>
        <li><strong>Sosyal Medya Baskısı:</strong> Online imaj kaygısı</li>
      </ul>
      
      <h4>4. Aile Baskısı ve Özgürlük Arayışı (%15)</h4>
      <p>Aile ile olan ilişkiler ve bağımsızlık mücadelesi:</p>
      <ul>
        <li><strong>Kariyer Beklentileri:</strong> Ailenin meslek seçimi baskısı</li>
        <li><strong>Finansal Bağımlılık:</strong> Harçlık ve masraf endişeleri</li>
        <li><strong>Yaşam Tarzı Çatışmaları:</strong> Geleneksel değerler vs modern yaşam</li>
        <li><strong>Evlilik Baskısı:</strong> Erken evlilik beklentileri</li>
      </ul>
      
      <h3>Üniversite İtiraflarının Psikolojik Analizi</h3>
      <p>Bu dönemde paylaşılan itiraflar, genellikle kimlik gelişimi ve bağımsızlık arayışının yansımalarıdır. Gelişim psikolojisi açısından bakıldığında:</p>
      
      <h4>Kimlik Gelişimi (Identity Development)</h4>
      <p>Erik Erikson'un psikososyal gelişim teorisine göre, üniversite çağındaki gençler "kimlik vs rol karmaşası" krizini yaşar. Bu dönemde paylaşılan itiraflar, bu kimlik arayışının dışa vurumudur.</p>
      
      <h4>Bağlanma Teorisi Perspektifi</h4>
      <p>Üniversite döneminde aile bağlarından uzaklaşma ve yeni bağlanma ilişkileri kurma süreci, birçok itirafın temelini oluşturur.</p>
      
      <h4>Sosyal Öğrenme Teorisi</h4>
      <p>Yeni sosyal ortamlarda rol model arayışı ve davranış öğrenme süreci, sosyal kaygı itiraflarının artmasına neden olur.</p>
      
      <h3>Üniversite Türlerine Göre İtiraf Farklılıkları</h3>
      
      <h4>Devlet Üniversiteleri</h4>
      <ul>
        <li>Daha çeşitli sosyoekonomik geçmişlerden öğrenciler</li>
        <li>Finansal kaygılar daha ön planda</li>
        <li>Sosyal sınıf farklılıkları kaynaklı itiraflar</li>
      </ul>
      
      <h4>Özel Üniversiteler</h4>
      <ul>
        <li>Sosyal baskı ve imaj kaygısı daha yoğun</li>
        <li>Lüks yaşam tarzı beklentileri</li>
        <li>Rekabet ortamı kaynaklı stres</li>
      </ul>
      
      <h4>Meslek Yüksekokulları</h4>
      <ul>
        <li>Pratik kaygılar ön planda</li>
        <li>İş bulma endişesi daha erken başlar</li>
        <li>Akademik vs pratik çelişkisi</li>
      </ul>
      
      <h3>Şehir Bazlı Farklılıklar</h3>
      
      <h4>Büyük Şehirler (İstanbul, Ankara, İzmir)</h4>
      <ul>
        <li>Daha liberal yaşam tarzı itirafları</li>
        <li>Yüksek yaşam maliyeti kaygıları</li>
        <li>Kalabalık içinde yalnızlık hissi</li>
      </ul>
      
      <h4>Küçük Şehirler</h4>
      <ul>
        <li>Geleneksel değerler vs modernlik çatışması</li>
        <li>Sınırlı sosyal aktivite seçenekleri</li>
        <li>Herkesin birbirini tanıması kaynaklı baskı</li>
      </ul>
      
      <h3>Sağlıklı İtiraf Paylaşımı İçin Öneriler</h3>
      
      <h4>Öğrenciler İçin:</h4>
      <ul>
        <li><strong>Duygusal Farkındalık:</strong> Duygularınızı bastırmak yerine sağlıklı yollarla ifade edin</li>
        <li><strong>Empati Kurma:</strong> Benzer deneyimlere sahip kişilerle bağ kurun</li>
        <li><strong>Profesyonel Destek:</strong> Gerektiğinde üniversite psikolojik danışmanlık merkezlerinden yardım alın</li>
        <li><strong>Kişisel Gelişim:</strong> İtiraflarınızı öz-farkındalık için bir araç olarak kullanın</li>
      </ul>
      
      <h4>Aileler İçin:</h4>
      <ul>
        <li>Çocuklarınızın bu dönemde yaşadığı zorlukları anlayın</li>
        <li>Baskı kurmak yerine destekleyici olun</li>
        <li>Açık iletişim kanalları oluşturun</li>
      </ul>
      
      <h3>Sonuç</h3>
      <p>Üniversite itirafları, genç yetişkinlerin yaşadığı evrensel deneyimlerin yansımasıdır. Bu itirafları anlamak, hem bireysel gelişim hem de toplumsal farkındalık açısından önemlidir. Anonim platformlar, bu kritik dönemde gençlerin kendilerini ifade etmeleri için güvenli bir alan sağlar.</p>
    `,
    category: 'Analiz',
    readTime: '15 dk',
    publishDate: '2025-11-04',
    views: 890,
    likes: 67,
    comments: 18,
    slug: 'universite-itirafları-trendler'
  },
  {
    id: 3,
    title: 'Aşk İtiraflarının Psikolojisi: Neden Anonim Paylaşırız?',
    excerpt: 'Aşk itiraflarını anonim olarak paylaşmanın arkasındaki psikolojik nedenler ve bu paylaşımların duygusal faydaları.',
    content: `
      <h2>Aşk İtiraflarının Anonim Doğası</h2>
      <p>Aşk, insanlığın en evrensel deneyimlerinden biri olmasına rağmen, aşk itirafları genellikle en kişisel ve paylaşılması zor deneyimlerdir. Peki neden insanlar aşk itiraflarını anonim olarak paylaşmayı tercih ediyor? Bu sorunun cevabı, hem psikoloji hem de sosyoloji alanlarında derinlemesine araştırılmış bir konudur.</p>
      
      <p>Araştırmalar gösteriyor ki, aşk itirafları tüm itiraf türleri arasında en yüksek duygusal yoğunluğa sahip olanlarıdır. Bu durum, paylaşım sürecini hem daha anlamlı hem de daha riskli kılar.</p>
      
      <h3>Anonimliğin Psikolojik Faydaları</h3>
      
      <h4>1. Yargılanma Korkusunun Azalması</h4>
      <p>Sosyal psikoloji araştırmalarına göre, insanların %87'si aşk deneyimlerini paylaşırken yargılanma korkusu yaşar. Anonim ortamda, bu korku minimum seviyeye iner çünkü:</p>
      <ul>
        <li><strong>Sosyal Kimlik Gizliliği:</strong> Gerçek kimliğiniz bilinmediği için sosyal statünüz risk altında değil</li>
        <li><strong>Çevre Baskısı Yokluğu:</strong> Aile, arkadaş çevresi veya iş arkadaşlarının tepkisinden endişe etmezsiniz</li>
        <li><strong>Gelecek Kaygısı Azalması:</strong> Paylaştığınız bilgilerin gelecekte size zarar verme riski yoktur</li>
      </ul>
      
      <h4>2. Duygusal Katarsis ve Rahatlama</h4>
      <p>Sigmund Freud'un katarsis teorisine göre, bastırılan duyguları dışa vurmak psikolojik rahatlama sağlar. Aşk itirafları, bu katartik etkiyi en güçlü şekilde yaşatan deneyimlerdir:</p>
      <ul>
        <li><strong>Duygusal Boşalma:</strong> İçinizde biriken duyguları dışa vurma</li>
        <li><strong>Psikolojik Rahatlama:</strong> Zihinsel yükün hafiflemesi</li>
        <li><strong>Öz-Kabul:</strong> Kendi duygularınızı kabul etme süreci</li>
        <li><strong>Duygusal Düzenleme:</strong> Karmaşık duyguları organize etme</li>
      </ul>
      
      <h4>3. Empati ve Sosyal Bağ Kurma</h4>
      <p>Benzer deneyimlere sahip kişilerle anonim ortamda kurulan bağ, yalnızlık hissini azaltır ve duygusal destek sağlar. Bu süreçte yaşananlar:</p>
      <ul>
        <li><strong>Evrensellik Hissi:</strong> "Sadece ben yaşamıyorum" farkındalığı</li>
        <li><strong>Duygusal Validasyon:</strong> Duygularınızın normal olduğunu anlama</li>
        <li><strong>Sosyal Destek:</strong> Benzer deneyimlerden öğrenme</li>
        <li><strong>Topluluk Hissi:</strong> Anonim bir topluluğa ait olma</li>
      </ul>
      
      <h3>En Yaygın Aşk İtirafı Türleri ve Psikolojik Analizi</h3>
      
      <h4>1. Platonik Aşk İtirafları (%42)</h4>
      <p>Karşılıksız aşk hikayeleri, en çok paylaşılan itiraf türlerinden biri. Bu itirafların psikolojik dinamikleri:</p>
      <ul>
        <li><strong>Güvenli Mesafe:</strong> Reddedilme riskini almadan duyguları ifade etme</li>
        <li><strong>İdealizasyon:</strong> Karşı tarafı mükemmelleştirme eğilimi</li>
        <li><strong>Fantezi Dünyası:</strong> Gerçekleşmeyecek senaryolar kurma</li>
        <li><strong>Duygusal Yoğunluk:</strong> Karşılıksızlığın getirdiği yoğun duygular</li>
      </ul>
      
      <h4>2. İlk Aşk Deneyimleri (%28)</h4>
      <p>İlk aşkın masumiyeti ve yoğunluğu, nostaljik bir değer taşır:</p>
      <ul>
        <li><strong>Nostaljik Değer:</strong> Geçmişe özlem ve hatırlama</li>
        <li><strong>Masumiyet:</strong> Deneyimsizliğin getirdiği saflık</li>
        <li><strong>Yoğunluk:</strong> İlk kez yaşanan duyguların şiddeti</li>
        <li><strong>Öğrenme Süreci:</strong> Aşkı tanıma ve anlama</li>
      </ul>
      
      <h4>3. Ayrılık ve Kalp Kırıklığı Hikayeleri (%18)</h4>
      <p>İlişki sonları ve kalp kırıklıkları, iyileşme sürecinin bir parçası olarak paylaşılır:</p>
      <ul>
        <li><strong>Yas Süreci:</strong> Kaybı kabul etme aşamaları</li>
        <li><strong>Öfke İfadesi:</strong> Bastırılan öfkeyi dışa vurma</li>
        <li><strong>Anlam Arayışı:</strong> "Neden?" sorusuna cevap arama</li>
        <li><strong>İyileşme:</strong> Duygusal yaraları sarma süreci</li>
      </ul>
      
      <h4>4. Yasak Aşk İtirafları (%12)</h4>
      <p>Toplumsal normlar gereği paylaşılamayan aşk hikayeleri:</p>
      <ul>
        <li><strong>Sosyal Tabu:</strong> Toplumca kabul edilmeyen ilişkiler</li>
        <li><strong>Suçluluk Hissi:</strong> Ahlaki çelişki yaşama</li>
        <li><strong>Gizlilik İhtiyacı:</strong> Kimsenin bilmemesi gereken sırlar</li>
        <li><strong>İç Çelişki:</strong> Kalp ile akıl arasındaki savaş</li>
      </ul>
      
      <h3>Yaş Gruplarına Göre Aşk İtirafı Farklılıkları</h3>
      
      <h4>Genç Yetişkinler (18-25 yaş)</h4>
      <ul>
        <li>Daha romantik ve idealist yaklaşım</li>
        <li>İlk deneyimler ağırlıkta</li>
        <li>Yoğun duygusal ifadeler</li>
        <li>Gelecek kaygısı az</li>
      </ul>
      
      <h4>Yetişkinler (26-35 yaş)</h4>
      <ul>
        <li>Daha realist bakış açısı</li>
        <li>İlişki dinamikleri analizi</li>
        <li>Kariyer-aşk dengesi</li>
        <li>Evlilik ve gelecek planları</li>
      </ul>
      
      <h4>Orta Yaş (36-50 yaş)</h4>
      <ul>
        <li>Evlilik içi sorunlar</li>
        <li>Orta yaş krizi aşkları</li>
        <li>Geçmişe özlem</li>
        <li>Aile sorumluluğu çelişkileri</li>
      </ul>
      
      <h3>Cinsiyet Farklılıkları</h3>
      
      <h4>Kadın İtirafları</h4>
      <ul>
        <li>Daha detaylı duygusal anlatım</li>
        <li>İlişki dinamiklerine odaklanma</li>
        <li>Empati ve anlayış arayışı</li>
        <li>Duygusal destek beklentisi</li>
      </ul>
      
      <h4>Erkek İtirafları</h4>
      <ul>
        <li>Daha kısa ve öz anlatım</li>
        <li>Eylem odaklı yaklaşım</li>
        <li>Çözüm arayışı</li>
        <li>Duygusal zayıflık korkusu</li>
      </ul>
      
      <h3>Sağlıklı Aşk İtirafı Paylaşımı İçin Öneriler</h3>
      
      <h4>Paylaşım Öncesi Hazırlık</h4>
      <ul>
        <li><strong>Duygusal Hazırlık:</strong> Duygularınızı bastırmak yerine sağlıklı yollarla ifade edin</li>
        <li><strong>Amaç Belirleme:</strong> Neden paylaşmak istediğinizi netleştirin</li>
        <li><strong>Sınır Koyma:</strong> Ne kadar detay paylaşacağınızı önceden belirleyin</li>
      </ul>
      
      <h4>Paylaşım Süreci</h4>
      <ul>
        <li><strong>Samimi Olma:</strong> Gerçek duygularınızı açık bir şekilde ifade edin</li>
        <li><strong>Öğrenme Açıklığı:</strong> Başkalarının deneyimlerinden öğrenmeye açık olun</li>
        <li><strong>Empati:</strong> Benzer deneyimlere sahip kişilerle empati kurun</li>
      </ul>
      
      <h4>Paylaşım Sonrası</h4>
      <ul>
        <li><strong>Kişisel Gelişim:</strong> İtirafınızı öz-farkındalık için bir araç olarak kullanın</li>
        <li><strong>Profesyonel Destek:</strong> Gerektiğinde uzman yardımı almaktan çekinmeyin</li>
        <li><strong>Duygusal Sınırlar:</strong> Olumsuz tepkileri kişisel algılamayın</li>
      </ul>
      
      <h3>Aşk İtiraflarının Toplumsal Etkisi</h3>
      <p>Anonim aşk itirafları, sadece bireysel faydalar sağlamaz, aynı zamanda toplumsal bir işlev de görür:</p>
      <ul>
        <li><strong>Sosyal Normları Sorgulama:</strong> Geleneksel aşk kalıplarını sorgulatır</li>
        <li><strong>Empati Geliştirme:</strong> Farklı deneyimleri anlama kapasitesi artırır</li>
        <li><strong>Tabu Kırma:</strong> Konuşulmayan konuları gündeme getirir</li>
        <li><strong>Farkındalık Yaratma:</strong> Aşkın çeşitliliği hakkında bilinç oluşturur</li>
      </ul>
      
      <h3>Sonuç</h3>
      <p>Aşk itirafları, insan deneyiminin en derin ve anlamlı parçalarından biridir. Anonim paylaşım, bu deneyimleri güvenli bir ortamda ifade etme imkanı sunar ve hem bireysel hem de toplumsal düzeyde duygusal iyileşmeye katkıda bulunur. Bu itiraflar, aşkın evrensel doğasını gösterirken, her bireyin benzersiz deneyimini de vurgular.</p>
      
      <p>Unutmayın ki, her aşk itirafı bir cesaret gösterisidir ve bu cesaret, hem paylaşan kişiyi hem de okuyan kişileri daha güçlü kılar. Aşk, paylaşıldığında çoğalır ve anonim platformlar bu çoğalmanın en güvenli yoludur.</p>
    `,
    category: 'Psikoloji',
    readTime: '18 dk',
    publishDate: '2025-11-03',
    views: 1450,
    likes: 112,
    comments: 34,
    slug: 'ask-itiraflarinin-psikolojisi'
  }
];

export default async function BlogPage() {
  // Fetch blog posts from database
  let blogPosts = fallbackBlogPosts;
  
  try {
    const { data: dbPosts } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (dbPosts && dbPosts.length > 0) {
      blogPosts = dbPosts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content || '',
        category: post.category,
        readTime: post.read_time,
        publishDate: post.created_at,
        views: post.views_count,
        likes: post.likes_count,
        comments: post.comments_count,
        slug: post.slug
      }));
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Use fallback data
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            İtiraf Rehberi ve İpuçları
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Anonim itiraf paylaşımı hakkında rehberler, ipuçları ve en popüler itiraf hikayeleri
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="hover:text-purple-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishDate).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Devamını Oku
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* SEO Content */}
        <div className="mt-16">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">
              İtiraf Paylaşımının Faydaları
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <p>
                <strong>Anonim itiraf paylaşımı</strong>, modern toplumda duygusal sağlık ve 
                psikolojik rahatlama için önemli bir araçtır. Araştırmalar gösteriyor ki, 
                duygularını ifade eden kişiler daha sağlıklı bir ruh haline sahip oluyor.
              </p>
              
              <h3>Neden İtiraf Paylaşmalısınız?</h3>
              <ul>
                <li><strong>Duygusal Rahatlama:</strong> Bastırılan duyguları dışa vurmak psikolojik rahatlama sağlar</li>
                <li><strong>Toplumsal Bağ:</strong> Benzer deneyimlere sahip kişilerle empati kurabilirsiniz</li>
                <li><strong>Kişisel Gelişim:</strong> Deneyimlerinizi paylaşarak kendinizi daha iyi tanıyabilirsiniz</li>
                <li><strong>Anonim Güvenlik:</strong> Kimliğinizi gizleyerek güvenli bir ortamda paylaşım yapabilirsiniz</li>
              </ul>
              
              <h3>Güvenli İtiraf Paylaşımı</h3>
              <p>
                İtiraf Pazarı, kullanıcılarının güvenliğini ön planda tutar. Tüm paylaşımlar 
                anonim olarak yapılır ve kişisel bilgiler korunur. Moderasyon sistemi sayesinde 
                uygunsuz içerikler filtrelenir.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}