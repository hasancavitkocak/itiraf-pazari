// Mevcut gönderilerdeki yanlış filtrelenmiş kelimeleri düzelten script
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Yanlış filtrelenmiş kelimeler ve doğru halleri
const corrections = {
  'ak***': 'akşam',
  'ak****': 'akşam',
  'ak*****': 'akşamları',
  'ak******': 'akşamleyin',
  'ak*******': 'akşamüstü',
  'is***': 'islam',
  'is****': 'islami',
  'is*******': 'islamiyet',
  'sa****': 'samsun',
  'am*******': 'amsterdam',
  'ba*******': 'bambaşka',
  'ka**': 'kamp',
  'ka******': 'kampanya',
  'ka****': 'kampus',
  'am*': 'amp',
  'am***': 'amper',
  'am****': 'ampul',
  't**': 'tam',
  'ta***': 'tamam',
  'ta*****': 'tamamen',
  'ta****': 'tamami',
  'y**': 'yam',
  'ya****': 'yamyam',
  'ya***': 'yamuk',
  'h**': 'ham',
  'ha***': 'hamam',
  'ha****': 'hamur',
  'ha****i': 'hamsi',
  'am**': 'ama',
  'am***c': 'amaç',
  'am****a': 'amaçla',
  'am****ı': 'amaçlı',
  'am*****z': 'amaçsız'
}

async function fixFilteredPosts() {
  console.log('🔧 Yanlış filtrelenmiş gönderiler düzeltiliyor...')
  
  try {
    // Tüm gönderileri al
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content')
    
    if (error) {
      throw error
    }
    
    console.log(`📊 Toplam ${posts?.length} gönderi kontrol ediliyor...`)
    
    let fixedCount = 0
    
    for (const post of posts || []) {
      let titleFixed = post.title || ''
      let contentFixed = post.content || ''
      let hasChanges = false
      
      // Başlık düzeltmeleri
      for (const [wrong, correct] of Object.entries(corrections)) {
        if (titleFixed.includes(wrong)) {
          titleFixed = titleFixed.replace(new RegExp(wrong, 'gi'), correct)
          hasChanges = true
        }
        if (contentFixed.includes(wrong)) {
          contentFixed = contentFixed.replace(new RegExp(wrong, 'gi'), correct)
          hasChanges = true
        }
      }
      
      // Değişiklik varsa güncelle
      if (hasChanges) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            title: titleFixed,
            content: contentFixed
          })
          .eq('id', post.id)
        
        if (updateError) {
          console.error(`❌ Gönderi ${post.id} güncellenirken hata:`, updateError)
        } else {
          fixedCount++
          console.log(`✅ Gönderi ${post.id} düzeltildi`)
        }
      }
    }
    
    console.log(`🎉 Toplam ${fixedCount} gönderi düzeltildi!`)
    
  } catch (error) {
    console.error('❌ Hata:', error)
  }
}

// Script'i çalıştır
fixFilteredPosts()