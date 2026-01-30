import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // URL'den session algılamayı kapat
    flowType: 'implicit', // PKCE yerine implicit flow kullan
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    debug: false // Debug'ı kapat, çok gürültülü
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          role: string;
          is_premium: boolean;
          premium_expires_at: string | null;
          posts_today: number;
          reactions_today: number;
          last_post_date: string | null;
          last_reaction_date: string | null;
          is_banned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          is_premium: boolean;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          order_index: number;
          created_at: string;
        };
      };
      posts: {
        Row: {
          id: string;
          content: string;
          category_id: string;
          author_id: string | null;
          author_ip_hash: string;
          likes_count: number;
          dislikes_count: number;
          comments_count: number;
          reports_count: number;
          is_hidden: boolean;
          is_boosted: boolean;
          boosted_until: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          content: string;
          author_id: string | null;
          author_ip_hash: string;
          is_hidden: boolean;
          created_at: string;
        };
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string | null;
          ip_hash: string;
          type: 'like' | 'dislike';
          created_at: string;
        };
      };
      reports: {
        Row: {
          id: string;
          post_id: string;
          reporter_id: string | null;
          reporter_ip_hash: string;
          reason: string;
          created_at: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          merchant_oid: string;
          payment_type: 'subscription' | 'boost';
          amount: number;
          status: string;
          paytr_token: string | null;
          post_id: string | null;
          subscription_duration: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      boosts: {
        Row: {
          id: string;
          post_id: string;
          payment_id: string;
          boosted_until: string;
          created_at: string;
        };
      };
      ads: {
        Row: {
          id: string;
          name: string;
          position: 'header' | 'footer' | 'in_feed';
          content: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      seo_settings: {
        Row: {
          id: string;
          site_title: string;
          site_description: string;
          site_keywords: string;
          robots_txt: string;
          updated_at: string;
        };
      };
      bad_words: {
        Row: {
          id: string;
          word: string;
          created_at: string;
        };
      };
    };
  };
};
