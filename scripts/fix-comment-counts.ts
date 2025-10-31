// Tüm postların yorum sayılarını düzelten script
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixCommentCounts() {
  console.log('🔧 Yorum sayıları düzeltiliyor...');

  try {
    // Tüm postları al
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, comments_count');

    if (postsError) {
      throw postsError;
    }

    console.log(`📊 ${posts?.length || 0} post bulundu`);

    let fixedCount = 0;
    let totalProcessed = 0;

    for (const post of posts || []) {
      totalProcessed++;
      
      // Bu post için gerçek yorum sayısını hesapla
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('post_id', post.id)
        .eq('is_hidden', false);

      if (commentsError) {
        console.error(`❌ Post ${post.id} için yorum sayısı alınamadı:`, commentsError);
        continue;
      }

      const realCommentCount = comments?.length || 0;
      const currentCommentCount = post.comments_count || 0;

      // Eğer sayılar farklıysa düzelt
      if (realCommentCount !== currentCommentCount) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ comments_count: realCommentCount })
          .eq('id', post.id);

        if (updateError) {
          console.error(`❌ Post ${post.id} güncellenemedi:`, updateError);
        } else {
          console.log(`✅ Post ${post.id}: ${currentCommentCount} → ${realCommentCount}`);
          fixedCount++;
        }
      }

      // Progress göster
      if (totalProcessed % 10 === 0) {
        console.log(`📈 İşlenen: ${totalProcessed}/${posts?.length || 0}`);
      }
    }

    console.log(`🎉 Tamamlandı! ${fixedCount} post düzeltildi, ${totalProcessed} post işlendi`);

  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// Script'i çalıştır
if (require.main === module) {
  fixCommentCounts();
}

export { fixCommentCounts };
