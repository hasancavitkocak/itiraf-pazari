export interface ConfessionRequest {
  category?: string;
  mood?: 'funny' | 'serious' | 'romantic' | 'dramatic' | 'random';
  length?: 'short' | 'medium' | 'long';
}

export async function generateConfession(options: ConfessionRequest = {}) {
  try {
    const { category = 'genel', mood = 'random', length = 'medium' } = options;

    const moodPrompts = {
      funny: 'komik ve eğlenceli',
      serious: 'ciddi ve düşündürücü', 
      romantic: 'romantik ve duygusal',
      dramatic: 'dramatik ve etkileyici',
      random: 'çeşitli tonlarda'
    };

    const lengthGuides = {
      short: '30-50 kelime arası kısa bir hikaye',
      medium: '50-80 kelime arası detaylı bir hikaye', 
      long: '80-120 kelime arası uzun ve detaylı bir hikaye'
    };

    const prompt = `Sen bir Türk üniversite öğrencisisin ve gerçek bir itirafını paylaşıyorsun.

Kategori: ${category}
Ruh hali: ${moodPrompts[mood]}
Uzunluk: ${lengthGuides[length]}

İtiraf yazma kuralları:
- Gerçek bir hikaye anlat, yaşanmış gibi olsun
- Günlük konuşma dili kullan, samimi ol
- Detayları ver, sadece genel laflar etme
- Duygularını açık bir şekilde ifade et
- Üniversite hayatından spesifik durumlar anlat
- Kişisel bilgi verme ama hikayeyi canlı tut
- En az 40-50 kelime yaz

Örnek başlangıçlar:
- "Geçen hafta..."
- "Dün ders çıkışı..."
- "Sınav haftasında..."
- "Arkadaşımla..."
- "Kantinde otururken..."

Şimdi itirafını yaz:`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          options: {
            wait_for_model: true
          },
          parameters: {
            max_new_tokens: 100,
            temperature: 0.8,
            do_sample: true,
            top_p: 0.9,
            repetition_penalty: 1.1,
            return_full_text: false
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Hugging Face API Error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Hugging Face API Response:', result);
    
    if (!result || result.error) {
      throw new Error(`Hugging Face API returned error: ${result?.error || 'Unknown error'}`);
    }

    let confession = '';
    
    // Farklı response formatlarını handle et
    if (Array.isArray(result) && result[0]) {
      if (result[0].generated_text) {
        confession = result[0].generated_text;
      } else if (result[0].text) {
        confession = result[0].text;
      }
    } else if (result.generated_text) {
      confession = result.generated_text;
    } else if (result.text) {
      confession = result.text;
    }

    if (!confession) {
      throw new Error('No text generated from Hugging Face API');
    }
    
    // Temizlik
    confession = confession.replace(/^İtiraf:?\s*/i, '');
    confession = confession.replace(/^Şimdi itirafını yaz:?\s*/i, '');
    confession = confession.trim();
    
    // Çok kısa ise ilk 2 cümleyi al
    if (confession.length < 30) {
      const sentences = confession.split(/[.!?]+/);
      confession = sentences.slice(0, 2).join('. ').trim();
      if (!confession.endsWith('.')) confession += '.';
    }
    
    if (confession.length < 20) {
      // Fallback: Basit template kullan
      const templates = [
        `${category} konusunda çok karmaşık duygularım var. Bazen kendimi çok yalnız hissediyorum ve kimseye anlatamadığım şeyler var.`,
        `Üniversitede yaşadığım bir olay beni çok etkiledi. O günden beri ${category} hakkında farklı düşünüyorum.`,
        `Arkadaşlarıma söyleyemediğim bir sırrım var. ${category} ile ilgili ve beni çok zorluyor.`,
        `Geçenlerde ${category} konusunda çok utanç verici bir şey yaşadım. Hala aklımdan çıkmıyor.`
      ];
      confession = templates[Math.floor(Math.random() * templates.length)];
    }

    return {
      success: true,
      confession,
      metadata: {
        category,
        mood,
        length,
        wordCount: confession.split(' ').length,
        source: 'huggingface'
      }
    };

  } catch (error) {
    console.error('Hugging Face confession generation error:', error);
    
    // Fallback: Rastgele template (çok daha fazla çeşit)
    const fallbackTemplates = [
      "Geçen hafta sınavdan çıkarken koridorda yürürken ayağım takıldı ve tam hoşlandığım kişinin önünde yere düştüm. O kadar utandım ki bir hafta o koridordan geçemedim. Şimdi her gördüğümde kaçıyorum.",
      
      "Dün gece 3'e kadar ders çalıştım ama sabah alarm çalmadı. Sınava 1 saat geç kaldım ve hoca beni almadı. Annem için yalan söyledim, geçtim dedim. Şimdi nasıl açıklayacağımı bilmiyorum.",
      
      "Arkadaşımın sevgilisiyle WhatsApp'ta konuşuyoruz. Sadece ders konuları ama içimde garip bir his var. Arkadaşım bilse çok kızar ama o kadar tatlı konuşuyor ki durduramıyorum kendimi.",
      
      "Kantinde otururken yan masadaki kız sürekli bana bakıyordu. Cesaret edip gidecektim ama ayağa kalktığımda pantolonumda büyük bir yırtık olduğunu fark ettim. Koşarak tuvalete gittim.",
      
      "Aileme mühendislik okuyorum dedim ama aslında sanat fakültesindeyim. 3 senedir yalan söylüyorum. Mezun olunca ne diyeceğimi bilmiyorum. Her gün bu yükle yaşamak çok zor.",
      
      "Sınıf grubuna yanlışlıkla hoşlandığım kişi hakkında yazdığım mesajı attım. Herkes gördü, o da gördü. Şimdi okula gitmek istemiyorum. Nasıl bu kadar aptal olabilirdim?",
      
      "Geçen ay doğum günümde kimse aramadı. Sadece annem ve babam. Sosyal medyada mutlu görünmeye çalışıyorum ama aslında çok yalnızım. Üniversitede gerçek arkadaş edinmek bu kadar zor olacağını bilmiyordum.",

      "Dün akşam yurtta uyurken rüyamda konuşmuşum. Oda arkadaşım sabah bana hoşlandığım kişinin adını söylediğimi söyledi. Şimdi herkes biliyor ve çok utanıyorum.",

      "Kütüphanede ders çalışırken karşı masadaki çocukla göz göze geldik. Gülümsedi, ben de gülümsedim. Sonra kalktı geldi ve benden kalem istedi. Heyecandan hiçbir şey diyemedim.",

      "Geçen hafta yanlış derse girdim. 1 saat boyunca oturdum, hiçbir şey anlamadım ama çıkmaya utandım. Sonunda anladım ki bu ders benim bölümümden değil. Kimseye söylemedim.",

      "Aileme harçlık için para istedim ama aslında hoşlandığım kişiye hediye almak için. 200 lira verdiler, hala hediyeyi alamadım. Parayı başka şeylere harcadım, şimdi pişmanım.",

      "Dün gece arkadaşlarla dışarı çıktık. Hoşlandığım kişi de vardı. Cesaret edip dans etmeye davet ettim ama ayağına bastım. O kadar utandım ki erken ayrıldım.",

      "Sınıfta hoca bana soru sordu, cevabı biliyordum ama o kadar heyecanlandım ki tamamen farklı bir şey söyledim. Herkes güldü, hoca da şaşırdı. Hala aklımdan çıkmıyor.",

      "Geçen hafta yurtta duş alırken sabunu düşürdüm. Eğilirken kapı açıldı ve kat arkadaşım gördü. İkimiz de çok utandık, o günden beri göz göze gelemiyoruz.",

      "Kafeteryada yemek yerken hoşlandığım kişi yanıma oturdu. O kadar heyecanlandım ki çatalı düşürdüm. Eğilirken kafamı masaya çarptım. Çok gürültü çıktı, herkes baktı.",

      "Dün gece arkadaşımla telefonda konuşurken yanlışlıkla hoşlandığım kişiyi aradım. 3 saniye konuştuk, sonra kapadım. Şimdi ne diyeceğimi bilmiyorum.",

      "Geçen ay bursumu kaybettim ama aileme söyleyemedim. Her ay para istiyorum, çalıştığımı sanıyorlar. Aslında arkadaşlarımdan borç alıyorum. Bu böyle devam edemez.",

      "Sınıfta grup ödevi vardı. Ben hiçbir şey yapmadım ama arkadaşlarım yaptı. Hoca beni de övdü, çok utandım. Onlara teşekkür bile edemedim.",

      "Dün akşam yurtta film izlerken ağladım. Oda arkadaşım gördü ve neden ağladığımı sordu. Filmi bahane ettim ama aslında kendimi çok yalnız hissediyorum.",

      "Geçen hafta sınıfta telefon çaldı. Herkes baktı, ben de şaşırdım. Meğer benim telefonmuş, sessize almayı unutmuşum. Hoca çok kızdı, dersten çıkardı.",

      "Kantinde sıra beklerken önümdeki kızın saçı çok güzeldi. Dokunmak istedim ama kendimi tutamadım ve dokundum. Döndü baktı, çok utandım ve kaçtım.",

      "Dün gece rüyamda hoşlandığım kişiyle evleniyordum. Sabah uyandığımda çok mutluydum, sonra gerçek olmadığını hatırladım. Bütün gün üzgün geçti.",

      "Geçen hafta yanlış otobüse bindim. 1 saat sonra fark ettim. Çok uzaklara gitmişim, geri dönmek için 2 saat sürdü. O gün hiç derse gidemedim.",

      "Sınıfta hoşlandığım kişinin yanına oturmak için erken gittim. Geldiğinde yanına oturdu ama ben o kadar heyecanlandım ki hiçbir şey konuşamadım. 2 saat sessiz oturdum.",

      "Dün akşam arkadaşlarla oyun oynarken hoşlandığım kişinin adını söyledim. Herkes duydu ve şaka yapmaya başladı. Çok utandım, erken ayrıldım.",

      "Geçen ay doğum günümü kutlamak için pasta aldım ama kimse gelmedi. Pastayı tek başıma yedim ve ağladım. Sosyal medyaya mutlu fotoğraflar attım.",

      "Kütüphanede ders çalışırken uyuyakalmışım. Uyandığımda herkes bana bakıyordu ve horladığımı söylediler. O kadar utandım ki bir hafta kütüphaneye gidemedim.",

      "Dün gece yurtta arkadaşlarla sohbet ederken yanlışlıkla çok kişisel bir şey anlattım. Şimdi pişmanım, herkes biliyor. Nasıl geri alacağımı bilmiyorum.",

      "Geçen hafta hoşlandığım kişiye mektup yazdım ama vermeye cesaret edemedim. Hala çantamda duruyor. Her gün okuyorum ama veremiyorum.",

      "Sınıfta hoca bana kitap okuttu. O kadar heyecanlandım ki kelimeleri yanlış okudum. Herkes güldü, hoca da düzeltti. Hala yüzüm kızarıyor hatırlayınca."
    ];
    
    const randomTemplate = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
    
    return {
      success: true,
      confession: randomTemplate,
      metadata: {
        category: options.category || 'genel',
        mood: options.mood || 'random',
        length: options.length || 'medium',
        wordCount: randomTemplate.split(' ').length,
        source: 'fallback'
      }
    };
  }
}