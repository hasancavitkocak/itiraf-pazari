export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "İtiraf Pazarı",
    "description": "Türkiye'nin en güvenli anonim itiraf paylaşım platformu",
    "url": "https://itirafpazari.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://itirafpazari.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "İtiraf Pazarı",
      "url": "https://itirafpazari.com"
    },
    "sameAs": [
      "https://itirafpazari.com"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}