import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  't**': 'tam',
  'ta***': 'tamam',
  'ta*****': 'tamamen',
  'h**': 'ham',
  'ha***': 'hamam',
  'ha****': 'hamur',
  'ha****i': 'hamsi',
  'a**': 'ama',
  'a****': 'amaç',
  'a*****': 'amaçla',
  'a******': 'amaçlı'
}

export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü yapılabilir burada
    
    // Tüm gönderileri al
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content')
    
    if (error) {
      throw error
    }
    
    let fixedCount = 0
    const fixedPosts = []
    
    for (const post of posts || []) {
      let titleFixed = post.title || ''
      let contentFixed = post.content || ''
      let hasChanges = false
      
      // Düzeltmeleri uygula
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
        
        if (!updateError) {
          fixedCount++
          fixedPosts.push({
            id: post.id,
            oldTitle: post.title,
            newTitle: titleFixed,
            oldContent: post.content?.substring(0, 100) + '...',
            newContent: contentFixed.substring(0, 100) + '...'
          })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${fixedCount} gönderi başarıyla düzeltildi`,
      fixedCount,
      fixedPosts
    })
    
  } catch (error) {
    console.error('Error fixing posts:', error)
    return NextResponse.json(
      { success: false, error: 'Gönderiler düzeltilirken hata oluştu' },
      { status: 500 }
    )
  }
}
