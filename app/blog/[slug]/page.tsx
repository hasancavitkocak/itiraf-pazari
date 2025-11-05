import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Heart, MessageCircle, Eye, Share2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('is_published', true);

    if (posts && posts.length > 0) {
      return posts.map((post) => ({
        slug: post.slug,
      }));
    }
  } catch (error) {
    console.error('Error generating static params:', error);
  }

  // Fallback to static slugs
  return [
    { slug: 'anonim-itiraf-nasil-paylasilir' },
    { slug: 'universite-itirafları-trendler' },
    { slug: 'ask-itiraflarinin-psikolojisi' }
  ];
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (post) {
      return {
        title: `${post.title} | İtiraf Pazarı Blog`,
        description: post.meta_description || post.excerpt,
        keywords: post.keywords || [],
        openGraph: {
          title: post.title,
          description: post.meta_description || post.excerpt,
          url: `https://itirafpazari.com/blog/${post.slug}`,
          type: 'article',
          publishedTime: post.created_at,
          authors: ['İtiraf Pazarı'],
        },
        twitter: {
          card: 'summary_large_image',
          title: post.title,
          description: post.meta_description || post.excerpt,
        },
        alternates: {
          canonical: `https://itirafpazari.com/blog/${post.slug}`,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  // Fallback metadata
  const fallbackPost = fallbackBlogPosts.find(p => p.slug === slug);
  if (fallbackPost) {
    return {
      title: `${fallbackPost.title} | İtiraf Pazarı Blog`,
      description: fallbackPost.excerpt,
      keywords: fallbackPost.keywords,
    };
  }

  return {
    title: 'Blog Yazısı Bulunamadı | İtiraf Pazarı',
  };
}

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fallback blog posts data
const fallbackBlogPosts = [
  {
    id: 1,
    title: 'Anonim İtiraf Nasıl Paylaşılır? Kapsamlı Rehber',
    excerpt: 'Güvenli ve etkili bir şekilde anonim itiraf paylaşmanın püf noktalarını öğrenin. Kimliğinizi koruyarak duygularınızı ifade etmenin yolları.',
    content: `
      <h2>Anonim İtiraf Paylaşımının Temelleri</h2>
      <p>Anonim itiraf paylaşımı, modern dijital çağda duygusal rahatlama ve toplumsal bağ kurmanın önemli bir yoludur. Bu rehberde, güvenli ve etkili itiraf paylaşımının inceliklerini keşfedeceğiz.</p>
      
      <h3>1. Doğru Platform Seçimi</h3>
      <p>İtiraf paylaşırken en önemli faktör, güvenilir bir platform seçmektir. İtiraf Pazarı gibi özel olarak bu amaç için tasarlanmış platformlar, anonimliğinizi korurken toplulukla bağ kurmanızı sağlar.</p>
      
      <h3>2. Kişisel Bilgileri Koruma</h3>
      <ul>
        <li>Gerçek isim, telefon numarası veya adres gibi kişisel bilgileri asla paylaşmayın</li>
        <li>Sizi tanımlayabilecek özel detaylardan kaçının</li>
        <li>Coğrafi konum bilgilerini genel tutun</li>
      </ul>
      
      <h3>3. Etkili İtiraf Yazma Teknikleri</h3>
      <p>İyi bir itiraf, okuyucuyla duygusal bağ kurar ve samimi bir hikaye anlatır. İşte etkili itiraf yazmanın ipuçları:</p>
      <ul>
        <li><strong>Samimi olun:</strong> Gerçek duygularınızı paylaşın</li>
        <li><strong>Detay verin:</strong> Hikayenizi canlı kılacak detayları ekleyin</li>
        <li><strong>Sonuç ekleyin:</strong> Deneyiminizden ne öğrendiğinizi belirtin</li>
      </ul>
      
      <h3>4. Topluluk Kurallarına Uyum</h3>
      <p>Her platformun kendine özgü kuralları vardır. Bu kurallara uymak, hem sizin hem de diğer kullanıcıların güvenliğini sağlar.</p>
      
      <h3>5. Duygusal Hazırlık</h3>
      <p>İtiraf paylaşmak duygusal olarak zorlayıcı olabilir. Kendinizi hazırlayın ve gerekirse profesyonel destek alın.</p>
      
      <h3>Sonuç</h3>
      <p>Anonim itiraf paylaşımı, doğru yaklaşımla hem kişisel gelişim hem de toplumsal bağ kurma açısından son derece faydalıdır. Bu rehberdeki ipuçlarını takip ederek, güvenli ve etkili bir itiraf deneyimi yaşayabilirsiniz.</p>
    `,
    category: 'Rehber',
    readTime: '8 dk',
    publishDate: '2025-11-05',
    views: 1250,
    likes: 89,
    comments: 23,
    slug: 'anonim-itiraf-nasil-paylasilir',
    keywords: [
      'anonim itiraf nasıl paylaşılır',
      'itiraf paylaşma rehberi',
      'güvenli itiraf',
      'anonim paylaşım',
      'itiraf yazma teknikleri',
      'gizli itiraf',
      'itiraf ipuçları'
    ]
  },
  {
    id: 2,
    title: 'Üniversite İtirafları: En Popüler Konular ve Trendler',
    excerpt: 'Üniversite öğrencilerinin en çok paylaştığı itiraf konuları ve bu hikayelerin arkasındaki psikolojik faktörler.',
    content: `
      <h2>Üniversite Döneminin İtiraf Dinamikleri</h2>
      <p>Üniversite yılları, gençlerin kimlik arayışı içinde oldukları ve yoğun duygusal deneyimler yaşadıkları bir dönemdir. Bu dönemde paylaşılan itiraflar, genç yetişkinlerin iç dünyasına dair önemli ipuçları verir.</p>
      
      <h3>En Popüler Üniversite İtiraf Konuları</h3>
      
      <h4>1. Aşk ve İlişkiler (%35)</h4>
      <p>Üniversite öğrencilerinin en çok paylaştığı itiraflar aşk ve ilişki konularında. İlk aşk deneyimleri, kalp kırıklıkları ve platonik aşklar bu kategorinin başını çekiyor.</p>
      
      <h4>2. Akademik Stres (%28)</h4>
      <p>Sınav kaygısı, not endişesi ve gelecek korkusu gibi akademik stres faktörleri öğrencilerin sıkça paylaştığı konular arasında.</p>
      
      <h4>3. Sosyal Kaygılar (%22)</h4>
      <p>Arkadaş edinme zorluğu, sosyal ortamlarda kendini ifade edememe ve yalnızlık hissi gibi sosyal kaygılar.</p>
      
      <h4>4. Aile Baskısı (%15)</h4>
      <p>Aile beklentileri, kariyer seçimi konusundaki baskılar ve özgürlük arayışı.</p>
      
      <h3>Üniversite İtiraflarının Psikolojik Analizi</h3>
      <p>Bu dönemde paylaşılan itiraflar, genellikle kimlik gelişimi ve bağımsızlık arayışının yansımalarıdır. Öğrenciler, anonim platformlarda kendilerini daha rahat ifade edebilir ve benzer deneyimlere sahip kişilerle bağ kurabilirler.</p>
      
      <h3>Sağlıklı İtiraf Paylaşımı İçin Öneriler</h3>
      <ul>
        <li>Duygularınızı bastırmak yerine sağlıklı yollarla ifade edin</li>
        <li>Benzer deneyimlere sahip kişilerle empati kurun</li>
        <li>Gerektiğinde profesyonel destek almaktan çekinmeyin</li>
        <li>İtiraflarınızı kişisel gelişim için bir araç olarak kullanın</li>
      </ul>
    `,
    category: 'Analiz',
    readTime: '6 dk',
    publishDate: '2025-11-04',
    views: 890,
    likes: 67,
    comments: 18,
    slug: 'universite-itirafları-trendler',
    keywords: [
      'üniversite itirafları',
      'öğrenci itirafları',
      'üniversite hikayeleri',
      'akademik stres',
      'üniversite aşkı',
      'öğrenci psikolojisi'
    ]
  },
  {
    id: 3,
    title: 'Aşk İtiraflarının Psikolojisi: Neden Anonim Paylaşırız?',
    excerpt: 'Aşk itiraflarını anonim olarak paylaşmanın arkasındaki psikolojik nedenler ve bu paylaşımların duygusal faydaları.',
    content: `
      <h2>Aşk İtiraflarının Anonim Doğası</h2>
      <p>Aşk, insanlığın en evrensel deneyimlerinden biri olmasına rağmen, aşk itirafları genellikle en kişisel ve paylaşılması zor deneyimlerdir. Peki neden insanlar aşk itiraflarını anonim olarak paylaşmayı tercih ediyor?</p>
      
      <h3>Anonimliğin Psikolojik Faydaları</h3>
      
      <h4>1. Yargılanma Korkusunun Azalması</h4>
      <p>Anonim ortamda, sosyal yargılanma korkusu minimum seviyeye iner. Bu durum, kişinin gerçek duygularını daha samimi bir şekilde ifade etmesini sağlar.</p>
      
      <h4>2. Duygusal Katarsis</h4>
      <p>Bastırılan duyguları dışa vurmak, psikolojik rahatlama sağlar. Aşk itirafları, bu katartik etkiyi en güçlü şekilde yaşatan deneyimlerdir.</p>
      
      <h4>3. Empati ve Bağ Kurma</h4>
      <p>Benzer deneyimlere sahip kişilerle anonim ortamda kurulan bağ, yalnızlık hissini azaltır ve duygusal destek sağlar.</p>
      
      <h3>En Yaygın Aşk İtirafı Türleri</h3>
      
      <h4>Platonik Aşk İtirafları</h4>
      <p>Karşılıksız aşk hikayeleri, en çok paylaşılan itiraf türlerinden biri. Bu itiraflar genellikle yoğun duygusal içerik taşır.</p>
      
      <h4>İlk Aşk Deneyimleri</h4>
      <p>İlk aşkın masumiyeti ve yoğunluğu, nostaljik bir değer taşır ve okuyucularla güçlü duygusal bağ kurar.</p>
      
      <h4>Ayrılık Hikayeleri</h4>
      <p>İlişki sonları ve kalp kırıklıkları, iyileşme sürecinin bir parçası olarak paylaşılır.</p>
      
      <h3>Sağlıklı Aşk İtirafı Paylaşımı</h3>
      <ul>
        <li>Duygularınızı bastırmak yerine sağlıklı yollarla ifade edin</li>
        <li>Başkalarının deneyimlerinden öğrenmeye açık olun</li>
        <li>İtirafınızı kişisel gelişim için bir araç olarak kullanın</li>
        <li>Gerektiğinde profesyonel destek almaktan çekinmeyin</li>
      </ul>
      
      <h3>Sonuç</h3>
      <p>Aşk itirafları, insan deneyiminin en derin ve anlamlı parçalarından biridir. Anonim paylaşım, bu deneyimleri güvenli bir ortamda ifade etme imkanı sunar ve duygusal iyileşmeye katkıda bulunur.</p>
    `,
    category: 'Psikoloji',
    readTime: '7 dk',
    publishDate: '2025-11-03',
    views: 1450,
    likes: 112,
    comments: 34,
    slug: 'ask-itiraflarinin-psikolojisi',
    keywords: [
      'aşk itirafları',
      'anonim aşk',
      'aşk psikolojisi',
      'platonik aşk',
      'ilk aşk',
      'kalp kırıklığı',
      'aşk hikayeleri'
    ]
  }
];



export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  
  // Try to fetch from database first
  let post: any = null;
  
  try {
    const { data: dbPost } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (dbPost) {
      post = {
        id: dbPost.id,
        title: dbPost.title,
        excerpt: dbPost.excerpt,
        content: dbPost.content,
        category: dbPost.category,
        readTime: dbPost.read_time,
        publishDate: dbPost.created_at,
        views: dbPost.views_count,
        likes: dbPost.likes_count,
        comments: dbPost.comments_count,
        slug: dbPost.slug,
        author: 'İtiraf Pazarı'
      };
    }
  } catch (error) {
    console.error('Error fetching blog post:', error);
  }

  // Fallback to static data if database fetch fails
  if (!post) {
    post = fallbackBlogPosts.find(p => p.slug === slug);
  }
  
  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Blog'a Dön
            </Button>
          </Link>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-sm text-gray-500">{post.readTime}</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishDate).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author || 'İtiraf Pazarı'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Paylaş
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div 
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </Card>
          
          {/* Related Articles */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">İlgili Yazılar</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {fallbackBlogPosts
                .filter(p => p.slug !== post.slug)
                .slice(0, 2)
                .map((relatedPost) => (
                  <Card key={relatedPost.id} className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {relatedPost.category}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-2">
                      <Link 
                        href={`/blog/${relatedPost.slug}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{relatedPost.readTime}</span>
                      <span>{new Date(relatedPost.publishDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}