export function StructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "İtiraf Pazarı",
    "alternateName": "Anonim İtiraf Sitesi",
    "description": "Türkiye'nin en güvenli anonim itiraf paylaşım platformu. Aşk, iş, okul ve kişisel itiraflarınızı kimliğinizi gizleyerek paylaşın.",
    "url": "https://www.itirafpazari.com",
    "inLanguage": "tr-TR",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.itirafpazari.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "İtiraf Pazarı",
      "url": "https://www.itirafpazari.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.itirafpazari.com/logo.png"
      }
    },
    "sameAs": [
      "https://www.itirafpazari.com"
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "İtiraf Pazarı",
    "url": "https://www.itirafpazari.com",
    "logo": "https://www.itirafpazari.com/logo.png",
    "description": "Türkiye'nin en güvenli anonim itiraf paylaşım platformu",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://www.itirafpazari.com/contact"
    },
    "sameAs": [
      "https://www.itirafpazari.com"
    ]
  };

  const webApplicationData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "İtiraf Pazarı",
    "url": "https://www.itirafpazari.com",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web Browser",
    "description": "Türkiye'nin en güvenli anonim itiraf paylaşım platformu. 50+ şehir, 150+ üniversite desteği.",
    "inLanguage": "tr-TR",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY",
      "description": "Ücretsiz kullanım",
      "availability": "https://schema.org/InStock"
    },
    "featureList": [
      "100% Anonim itiraf paylaşımı",
      "Aşk, üniversite, iş itirafları",
      "50+ şehir bazlı filtreleme",
      "150+ üniversite desteği",
      "Kategori bazlı filtreleme",
      "Yorum yapma ve etkileşim",
      "Beğeni/beğenmeme sistemi",
      "Güvenli içerik moderasyonu",
      "PWA (Progressive Web App) desteği",
      "Mobil uyumlu tasarım"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "İtiraf Pazarı"
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://www.itirafpazari.com"
      }
    ]
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "İtiraf Pazarı nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "İtiraf Pazarı, Türkiye'nin en güvenli anonim itiraf paylaşım platformudur. Kullanıcılar kimliklerini gizleyerek aşk, üniversite, iş ve kişisel itiraflarını paylaşabilir."
        }
      },
      {
        "@type": "Question",
        "name": "İtiraf paylaşmak gerçekten anonim mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, tamamen anonimdir. Hiçbir kişisel bilgi istenmez, kayıt gerektirmez ve IP adresleri loglanmaz. Kimliğiniz tamamen gizli kalır."
        }
      },
      {
        "@type": "Question",
        "name": "İtiraf Pazarı ücretsiz mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, İtiraf Pazarı tamamen ücretsizdir. Tüm temel özellikler ücretsiz kullanılabilir. Premium özellikler opsiyoneldir."
        }
      },
      {
        "@type": "Question",
        "name": "Hangi şehirlerden itiraf paylaşabilirim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Türkiye'nin 50+ şehrinden itiraf paylaşabilir ve okuyabilirsiniz. İstanbul, Ankara, İzmir, Bursa, Antalya gibi tüm büyük şehirler desteklenmektedir."
        }
      },
      {
        "@type": "Question",
        "name": "Üniversite itirafları nasıl paylaşılır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "İtiraf paylaşırken üniversite kategorisini seçin ve üniversitenizi belirtin. 150+ Türk üniversitesi sistemde kayıtlıdır."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
