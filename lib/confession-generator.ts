import { 
  geminiModel, 
  getRandomCity, 
  getRandomCategory, 
  getRandomAge, 
  getRandomProfession, 
  getRandomGender 
} from './gemini';

export interface ConfessionParams {
  il?: string;
  ilce?: string;
  kategori?: string;
  yas?: string;
  meslek?: string;
  cinsiyet?: string;
}

export async function generateConfession(params?: ConfessionParams) {
  // Rastgele parametreler oluştur (eğer verilmemişse)
  const city = params?.il && params?.ilce ? 
    { il: params.il, ilce: params.ilce } : 
    getRandomCity();
  
  const kategori = params?.kategori || getRandomCategory();
  const yas = params?.yas || getRandomAge();
  const meslek = params?.meslek || getRandomProfession();
  const cinsiyet = params?.cinsiyet || getRandomGender();

  // Kategori-spesifik prompt oluştur - hepsi günlük hayat odaklı
  const categoryPrompts = {
    'ask': 'aşk hayatından, sevgili ilişkilerinden, flört deneyimlerinden bir itiraf',
    'arkadaslik': 'arkadaşlık ilişkilerinden, dostluk problemlerinden bir itiraf',
    'aile': 'aile içi yaşananlardan, anne-baba-kardeş ilişkilerinden bir itiraf',
    'is': 'iş hayatından, işyeri deneyimlerinden, meslek yaşamından bir itiraf',
    'okul': 'okul/üniversite hayatından, eğitim deneyimlerinden bir itiraf',
    'cinsellik': 'kişisel cinsel deneyimlerden, ilişki yaşamından bir itiraf',
    'kayip-esya': 'kaybettiğin değerli eşyalar, kayıp anılarla ilgili bir itiraf',
    'havadan-sudan': 'günlük yaşamdan, rastgele düşüncelerden, genel hayat deneyimlerinden bir itiraf',
    'gizli': 'kimseye söyleyemediğin sırlardan, gizli düşüncelerden bir itiraf'
  };

  const categoryDescription = categoryPrompts[kategori] || 'genel konularda samimi bir itiraf';

  // Çok spesifik itiraf örnekleri ile prompt
  const confessionExamples = {
    'ask': `"3 yıldır evliyim ama işyerindeki bir arkadaşıma aşık oldum. Her sabah işe giderken onu göreceğim diye heyecanlanıyorum. Eşim fark etmesin diye çok dikkat ediyorum ama bu duyguları yaşamak beni hem mutlu ediyor hem de suçluluk duygusuyla dolduruyor. Dün o arkadaşımla kahve içtik ve..."`,
    'arkadaslik': `"En yakın arkadaşım benim sevgilimle flört ediyor ve ben bunu biliyorum. Ona söylemek istiyorum ama arkadaşlığımızı kaybetmekten korkuyorum. Geçen hafta onları birlikte görünce kalbim kırıldı ama..."`,
    'aile': `"Annemle 6 aydır konuşmuyoruz. Sebep çok saçma bir tartışmaydı ama ikimiz de inatçıyız. Her gün onu arayıp özür dilemek istiyorum ama gururum engel oluyor. Dün hastaneye gittiğini duydum ve..."`,
    'is': `"Patronum bana sürekli bağırıyor ve ben artık dayanamıyorum. Dün toplantıda herkesin önünde beni azarladı ve ben tuvalette ağladım. İşten ayrılmak istiyorum ama maddi durumum elvermediği için..."`,
    'okul': `"Üniversitede matematik hocamıza aşık oldum. 45 yaşında, evli ama çok karizmatik. Derslere sadece onu görmek için gidiyorum. Geçen hafta ofisine gittiğimde..."`,
    'cinsellik': `"Eşimle cinsel hayatımızda sorunlar yaşıyoruz. 2 yıldır neredeyse hiç yakınlaşmıyoruz. Ben istek duyuyorum ama o sürekli bahane buluyor. Bu durumun evliliğimizi bitireceğinden korkuyorum..."`,
    'kayip-esya': `"Annemin bana verdiği altın yüzüğü kaybettim. O yüzük 3 kuşaktır ailemizde geçiyordu. Kaybettiğimi anneме söyleyemedim, sürekli takıyormuş gibi davranıyorum. Her gün onu arıyorum ama..."`,
    'havadan-sudan': `"Komşumun köpeği her gece havlıyor ve ben uyuyamıyorum. Ona söylemeye çekiniyorum çünkü iyi komşuluk ilişkimizi bozmak istemiyorum. Ama artık çok yorgunum ve..."`,
    'gizli': `"Kimseye söyleyemediğim bir sırrım var. 5 yıl önce bir trafik kazasına sebep oldum ama kimse görmedi. Karşı tarafın arabası hasar gördü ama ben kaçtım. O günden beri vicdanım rahat değil..."`
  };

  const exampleConfession = confessionExamples[kategori] || confessionExamples['havadan-sudan'];

  // Anonim itiraf için düzeltilmiş prompt
  const prompt = `
${city.il}, ${city.ilce}'de yaşayan ${yas} yaşında ${cinsiyet} bir ${meslek} olarak kişisel bir itiraf yazıyorsun.

ÖNEMLİ: İSİM YAZMA! Anonim itiraf olacak.

ZORUNLU: 250-300 KARAKTER YAZ! Çok uzun yazma!

${categoryDescription} konusunda uzun bir itiraf anlat:

1. BAŞLANGIÇ: Durumu anlat (50+ kelime)
2. GELİŞME: Detayları, yaşananları anlat (100+ kelime) 
3. DUYGULAR: Neler hissettiğini anlat (50+ kelime)
4. SONUÇ: Şu anki durumu anlat (50+ kelime)

ÖRNEK DOĞRU İTİRAF:
"3 yıldır evliyim ama işyerindeki bir arkadaşıma aşık oldum. Her sabah işe giderken onu göreceğim diye heyecanlanıyorum. Pazarlama departmanında çalışıyor. İlk gördüğümde çok etkilenmiştim ama evli olduğum için kendimi frenledim. 

Ama zamanla onunla daha çok vakit geçirmeye başladık. Öğle yemeklerinde aynı masada oturuyoruz, projeler hakkında konuşuyoruz. Geçen hafta bana çok yakın oturdu ve parfümünün kokusunu aldığımda kalbim çok hızlı atmaya başladı. 

Eşim fark etmesin diye çok dikkat ediyorum ama bu duyguları yaşamak beni hem mutlu ediyor hem de suçluluk duygusuyla dolduruyor. Gece yatağımda onun gülüşünü düşünüyorum. Sabah kalktığımda ilk aklıma gelen o oluyor.

Dün onunla kahve içtik ve bana kişisel hayatından bahsetti. O da evli ama mutlu değilmiş. Bu durumun nereye gideceğini bilmiyorum ama artık dayanamıyorum..."

ŞIMDI SEN DE AYNI TARZDA ${categoryDescription} konusunda ANONİM bir itiraf yaz. 

ZORUNLU KURALLAR:
- İSİM YAZMA! 
- 250-300 KARAKTER ARASI! Çok uzun yazma!
- İTİRAFI TAMAMEN BİTİR! Yarım bırakma!
- Hikayeyi sonuna kadar anlat!
- Cümleleri tam bitir!

İtirafını yaz:
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const confession = response.text();

    return {
      content: confession.trim(),
      metadata: {
        il: city.il,
        ilce: city.ilce,
        kategori,
        yas,
        meslek,
        cinsiyet,
        generated_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('İtiraf üretilemedi');
  }
}

// Test fonksiyonu
export async function testConfessionGeneration() {
  try {
    const confession = await generateConfession();
    console.log('Generated Confession:', confession);
    return confession;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}