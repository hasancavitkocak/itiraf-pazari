export function SSSStructuredData() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "İtiraf Pazarı nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "İtiraf Pazarı, kullanıcıların kimliklerini gizleyerek anonim olarak düşüncelerini, deneyimlerini ve itiraflarını paylaşabilecekleri güvenli bir platformdur."
        }
      },
      {
        "@type": "Question",
        "name": "Kayıt olmak zorunlu mu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır! İtiraf paylaşmak için kayıt olmanız gerekmez. Ancak yorum yapmak, beğeni/beğenmeme işlemleri için üye olmanız gerekir."
        }
      },
      {
        "@type": "Question",
        "name": "İtiraflarım gerçekten anonim mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet! İtiraflarınız tamamen anonimdir. Hiçbir kişisel bilginiz saklanmaz ve itiraflarınızda tanımlayıcı bilgiler görünmez."
        }
      },
      {
        "@type": "Question",
        "name": "Verilerim güvenli mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kesinlikle! Tüm verileriniz şifrelenmiş olarak saklanır. HTTPS protokolü kullanıyoruz ve kişisel bilgilerinizi asla üçüncü taraflarla paylaşmayız."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
    />
  );
}
