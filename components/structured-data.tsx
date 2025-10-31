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
    "description": "Anonim itiraf paylaşım platformu",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY",
      "description": "Ücretsiz kullanım"
    },
    "featureList": [
      "Anonim itiraf paylaşımı",
      "Kategori bazlı filtreleme",
      "Şehir ve ilçe bazlı filtreleme",
      "Yorum yapma",
      "Beğeni/beğenmeme",
      "Güvenli içerik moderasyonu"
    ]
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
    </>
  );
}
