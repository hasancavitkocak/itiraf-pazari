'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function SEOManagement() {
  const [settings, setSettings] = useState({
    site_title: '',
    site_description: '',
    site_keywords: '',
    robots_txt: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/seo');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error();

      toast.success('SEO ayarları kaydedildi');
    } catch (error) {
      toast.error('Kaydetme başarısız');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">SEO Yönetimi</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Site Başlığı</Label>
          <Input
            value={settings.site_title}
            onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Site Açıklaması</Label>
          <Textarea
            value={settings.site_description}
            onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Anahtar Kelimeler</Label>
          <Input
            value={settings.site_keywords}
            onChange={(e) => setSettings({ ...settings, site_keywords: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>robots.txt</Label>
          <Textarea
            value={settings.robots_txt}
            onChange={(e) => setSettings({ ...settings, robots_txt: e.target.value })}
            rows={5}
            className="font-mono text-sm"
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Kaydet
        </Button>
      </div>
    </Card>
  );
}
