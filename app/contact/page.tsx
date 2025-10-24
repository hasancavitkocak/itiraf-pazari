'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactForm } from '@/components/contact-form';
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Bize Ulaşın</h1>
            <p className="text-xl text-muted-foreground">
              Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçin
            </p>
          </div>
          
          <ContactForm />
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Hızlı Yanıt</h3>
              <p className="text-sm text-muted-foreground">
                Genellikle 24 saat içinde yanıt veriyoruz
              </p>
            </div>
            
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Güvenli İletişim</h3>
              <p className="text-sm text-muted-foreground">
                Tüm mesajlarınız güvenli bir şekilde saklanır
              </p>
            </div>
            
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Gizlilik</h3>
              <p className="text-sm text-muted-foreground">
                Kişisel bilgileriniz korunur ve paylaşılmaz
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}