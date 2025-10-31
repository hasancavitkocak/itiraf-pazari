'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Send, MessageCircle } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    subject: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success(data.message);
      setFormData({
        subject: '',
        email: '',
        message: ''
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-primary/10">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Bize Ulaşın</h2>
          <p className="text-muted-foreground">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Konu *</Label>
          <Input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject || ''}
            onChange={handleChange}
            placeholder="Mesajınızın konusu"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta (Opsiyonel)</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="E-posta adresiniz (opsiyonel)"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mesajınız *</Label>
          <Textarea
            id="message"
            name="message"
            value={formData.message || ''}
            onChange={handleChange}
            placeholder="Mesajınızı buraya yazınız..."
            rows={6}
            required
            disabled={loading}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full gap-2" 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Gönderiliyor...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Mesaj Gönder
            </>
          )}
        </Button>
      </form>


    </Card>
  );
}
