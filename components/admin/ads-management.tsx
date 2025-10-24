'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function AdsManagement() {
  const [ads, setAds] = useState<any[]>([]);
  const [newAd, setNewAd] = useState({
    name: '',
    position: 'header',
    content: '',
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/admin/ads');
      const data = await response.json();
      setAds(data.ads || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAd),
      });

      if (!response.ok) throw new Error();

      toast.success('Reklam eklendi');
      setNewAd({ name: '', position: 'header', content: '' });
      fetchAds();
    } catch (error) {
      toast.error('Ekleme başarısız');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Reklam Yönetimi</h2>
      <div className="space-y-6">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold">Yeni Reklam Ekle</h3>
          <div className="space-y-2">
            <Label>İsim</Label>
            <Input
              value={newAd.name}
              onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Pozisyon</Label>
            <Select value={newAd.position} onValueChange={(v) => setNewAd({ ...newAd, position: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Üst Banner</SelectItem>
                <SelectItem value="footer">Alt Banner</SelectItem>
                <SelectItem value="in_feed">Akış İçi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>HTML İçeriği</Label>
            <Textarea
              value={newAd.content}
              onChange={(e) => setNewAd({ ...newAd, content: e.target.value })}
              rows={4}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleCreate}>Reklam Ekle</Button>
        </div>

        <div className="space-y-3">
          {ads.map((ad) => (
            <div key={ad.id} className="p-4 border rounded-lg">
              <h4 className="font-semibold">{ad.name}</h4>
              <p className="text-sm text-muted-foreground">{ad.position}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
