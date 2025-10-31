'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, HelpCircle, Shield, Users, MessageCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'genel' | 'guvenlik' | 'kullanim' | 'teknik';
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [
  // Genel Sorular
  {
    id: 'nedir',
    question: 'İtiraf Pazarı nedir?',
    answer: 'İtiraf Pazarı, kullanıcıların kimliklerini gizleyerek anonim olarak düşüncelerini, deneyimlerini ve itiraflarını paylaşabilecekleri güvenli bir platformdur. Aşk, iş, okul, kişisel deneyimler gibi birçok kategoride itiraf paylaşabilirsiniz.',
    category: 'genel',
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: 'nasil-calisir',
    question: 'Platform nasıl çalışır?',
    answer: 'Çok basit! Ana sayfada "Yeni İtiraf Paylaş" butonuna tıklayın, itirafınızı yazın, kategori seçin ve paylaşın. İtirafınız hemen yayınlanır ve diğer kullanıcılar beğenebilir, yorum yapabilir.',
    category: 'genel',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'kayit-gerekli-mi',
    question: 'Kayıt olmak zorunlu mu?',
    answer: 'Hayır! İtiraf paylaşmak için kayıt olmanız gerekmez. Ancak yorum yapmak, beğeni/beğenmeme işlemleri için üye olmanız gerekir. Üyelik tamamen ücretsizdir.',
    category: 'genel',
    icon: <Users className="h-5 w-5" />
  },
  
  // Güvenlik Sorları
  {
    id: 'anonim-mi',
    question: 'İtiraflarım gerçekten anonim mi?',
    answer: 'Evet! İtiraflarınız tamamen anonimdir. Hiçbir kişisel bilginiz (IP adresi hariç güvenlik amaçlı) saklanmaz. İtiraflarınızda isminiz veya başka tanımlayıcı bilgiler görünmez.',
    category: 'guvenlik',
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: 'moderasyon',
    question: 'İçerik moderasyonu var mı?',
    answer: 'Evet! Otomatik küfür filtresi ve içerik moderasyon sistemimiz vardır. Uygunsuz içerikler otomatik olarak filtrelenir. Ayrıca kullanıcılar uygunsuz içerikleri raporlayabilir.',
    category: 'guvenlik',
    icon: <Shield className="h-5 w-5" />
  },
  
  // Kullanım Soruları
  {
    id: 'kategori-secimi',
    question: 'Hangi kategoriler mevcut?',
    answer: 'Aşk & İlişkiler, İş & Kariyer, Okul & Eğitim, Aile & Arkadaşlık, Kişisel Deneyimler ve daha fazlası. Sürekli yeni kategoriler ekliyoruz.',
    category: 'kullanim',
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    id: 'yorum-yapma',
    question: 'Nasıl yorum yapabilirim?',
    answer: 'Yorum yapmak için üye olmanız gerekir. Üye olduktan sonra herhangi bir itirafın altındaki yorum butonuna tıklayarak yorumunuzu yazabilirsiniz.',
    category: 'kullanim',
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    id: 'begeni-sistemi',
    question: 'Beğeni sistemi nasıl çalışır?',
    answer: 'Her itirafı beğenebilir veya beğenmeyebilirsiniz. Bu işlemler için üye olmanız gerekir. Beğeni sayıları itirafların popülerliğini gösterir.',
    category: 'kullanim',
    icon: <MessageCircle className="h-5 w-5" />
  },
  

  
  // Teknik Sorular
  {
    id: 'mobil-uygulama',
    question: 'Mobil uygulamanız var mı?',
    answer: 'Şu anda mobil uygulamamız yok, ancak web sitemiz mobil cihazlarda mükemmel çalışır. PWA (Progressive Web App) desteği ile mobil uygulama deneyimi sunuyoruz.',
    category: 'teknik',
    icon: <HelpCircle className="h-5 w-5" />
  },
  {
    id: 'sorun-bildirme',
    question: 'Teknik sorun yaşarsam ne yapmalıyım?',
    answer: 'Teknik sorunlar için "Bize Ulaşın" sayfasından bizimle iletişime geçebilirsiniz. Sorunlarınızı en kısa sürede çözmeye çalışıyoruz.',
    category: 'teknik',
    icon: <HelpCircle className="h-5 w-5" />
  },
  
  // Yeni Eklenen Sorular
  {
    id: 'itiraf-silme',
    question: 'İtirafımı silebilir miyim?',
    answer: 'Güvenlik ve anonimlik nedeniyle kullanıcılar kendi itiraflarını silemez. Ancak uygunsuz içerik paylaştıysanız "Bize Ulaşın" sayfasından bildirebilirsiniz. Moderatörlerimiz gerekli incelemeyi yapar.',
    category: 'kullanim',
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    id: 'detay-sayfasi',
    question: 'İtiraf detay sayfası nedir?',
    answer: 'Her itirafın kendine özel bir detay sayfası vardır. İtiraf kartına tıklayarak bu sayfaya gidebilir, yorumları görebilir, paylaşabilir ve etkileşimde bulunabilirsiniz. Bu sayfa üzerinden itirafı sosyal medyada da paylaşabilirsiniz.',
    category: 'kullanim',
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    id: 'yorum-goruntuleme',
    question: 'Yorumları görmek için üye olmam gerekir mi?',
    answer: 'Hayır! Yorumları görmek için üye olmanız gerekmez. Herkes tüm yorumları okuyabilir. Ancak yorum yapmak, beğenmek veya yorum beğenmek için üye olmanız gerekir.',
    category: 'kullanim',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'karakter-limiti',
    question: 'İtiraf yazarken karakter sınırı var mı?',
    answer: 'Evet, itiraflarınız maksimum 2000 karakter olabilir. Bu, yaklaşık 300-400 kelimelik bir metin demektir. Başlık için ise 100 karakter sınırı vardır.',
    category: 'kullanim',
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    id: 'konum-gizliligi',
    question: 'Konum bilgim güvende mi?',
    answer: 'Evet! Konum bilginiz tamamen güvendedir. Sadece seçtiğiniz il/ilçe bilgisi gösterilir, kesin konum bilginiz asla saklanmaz veya paylaşılmaz. İsterseniz özel konum da ekleyebilirsiniz.',
    category: 'guvenlik',
    icon: <Shield className="h-5 w-5" />
  }
];

const categoryNames = {
  genel: 'Genel Sorular',
  guvenlik: 'Güvenlik & Gizlilik',
  kullanim: 'Kullanım',
  teknik: 'Teknik Sorular'
};

const categoryColors = {
  genel: 'bg-blue-50 text-blue-700 border-blue-200',
  guvenlik: 'bg-green-50 text-green-700 border-green-200',
  kullanim: 'bg-purple-50 text-purple-700 border-purple-200',
  teknik: 'bg-gray-50 text-gray-700 border-gray-200'
};

export function SSSContent() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQ = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const categories = Object.keys(categoryNames) as Array<keyof typeof categoryNames>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl flex-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Sıkça Sorulan Sorular</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            İtiraf Pazarı hakkında merak ettiğiniz tüm soruların cevapları burada. 
            Aradığınızı bulamazsanız bizimle iletişime geçin.
          </p>
        </div>

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kategori Filtresi</CardTitle>
            <CardDescription>İlgilendiğiniz konuya göre soruları filtreleyebilirsiniz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Tüm Sorular ({faqData.length})
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    selectedCategory === category
                      ? categoryColors[category]
                      : 'bg-muted hover:bg-muted/80 border-transparent'
                  }`}
                >
                  {categoryNames[category]} ({faqData.filter(item => item.category === category).length})
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <Collapsible
                  open={openItems.includes(item.id)}
                  onOpenChange={() => toggleItem(item.id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                          <div className={`p-2 rounded-lg border ${categoryColors[item.category]}`}>
                            {item.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base md:text-lg">
                              {item.question}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[item.category]}`}>
                                {categoryNames[item.category]}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {openItems.includes(item.id) ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="pl-14">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Sorunuz burada yok mu?</h3>
              <p className="text-muted-foreground">
                Aradığınız cevabı bulamadıysanız, bizimle iletişime geçmekten çekinmeyin. 
                Size yardımcı olmaktan mutluluk duyarız.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Bize Ulaşın
                </a>
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
