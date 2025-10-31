'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PricingData {
  monthly: number;
  yearly: number;
}

export function PricingManagement() {
  const [pricing, setPricing] = useState<PricingData>({
    monthly: 49,
    yearly: 399,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/premium/pricing');
      if (response.ok) {
        const data = await response.json();
        if (data.pricing) {
          setPricing({
            monthly: data.pricing.monthly.price,
            yearly: data.pricing.yearly.price,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (pricing.monthly <= 0 || pricing.yearly <= 0) {
      toast.error('Fiyatlar 0\'dan büyük olmalıdır');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/premium/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthly_price: pricing.monthly,
          yearly_price: pricing.yearly,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Güncelleme başarısız');
      }

      toast.success('Premium fiyatları başarıyla güncellendi');
    } catch (error: any) {
      console.error('Pricing update error:', error);
      toast.error(error.message || 'Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (pricing.monthly <= 0) return 0;
    return Math.round((1 - (pricing.yearly / (pricing.monthly * 12))) * 100);
  };

  if (initialLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">Fiyatlar yükleniyor...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Premium Fiyat Yönetimi</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="monthly-price">Aylık Fiyat (TL)</Label>
            <Input
              id="monthly-price"
              type="number"
              min="1"
              step="0.01"
              value={pricing.monthly}
              onChange={(e) => setPricing({ 
                ...pricing, 
                monthly: parseFloat(e.target.value) || 0 
              })}
              placeholder="49.00"
            />
            <p className="text-xs text-muted-foreground">
              Aylık abonelik ücreti
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearly-price">Yıllık Fiyat (TL)</Label>
            <Input
              id="yearly-price"
              type="number"
              min="1"
              step="0.01"
              value={pricing.yearly}
              onChange={(e) => setPricing({ 
                ...pricing, 
                yearly: parseFloat(e.target.value) || 0 
              })}
              placeholder="399.00"
            />
            <p className="text-xs text-muted-foreground">
              Yıllık abonelik ücreti
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-3">Fiyat Özeti</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Aylık</p>
              <p className="text-lg font-semibold">₺{pricing.monthly.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Yıllık</p>
              <p className="text-lg font-semibold">₺{pricing.yearly.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Yıllık İndirim</p>
              <p className="text-lg font-semibold text-green-600">
                %{calculateDiscount()}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Yıllık plan ile kullanıcılar {(12 - (pricing.yearly / pricing.monthly)).toFixed(1)} ay ücretsiz alır
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Kaydediliyor...' : 'Fiyatları Kaydet'}
        </Button>
      </div>
    </Card>
  );
}
