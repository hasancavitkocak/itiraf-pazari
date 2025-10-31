import { NextRequest, NextResponse } from 'next/server';

// Basit bir in-memory store (gerçek uygulamada veritabanı kullanın)
let pricingData = {
  monthly: {
    price: 49,
    currency: 'TL',
    duration: 'monthly',
    features: [
      'Reklamsız deneyim',
      'Özel kategorilere erişim',
      'Sınırsız gönderi',
      'Özel reaksiyon emojileri'
    ]
  },
  yearly: {
    price: 399,
    currency: 'TL',
    duration: 'yearly',
    discount: 17,
    features: [
      'Reklamsız deneyim',
      'Özel kategorilere erişim',
      'Sınırsız gönderi',
      'Özel reaksiyon emojileri',
      'Öncelikli destek',
      '2 ay ücretsiz!'
    ]
  }
};

export async function GET() {
  try {
    return NextResponse.json({ 
      pricing: pricingData,
      success: true
    });
  } catch (error: any) {
    console.error('Pricing GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Fiyatlar yüklenirken hata oluştu' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monthly_price, yearly_price } = body;

    if (!monthly_price || !yearly_price) {
      return NextResponse.json(
        { error: 'Aylık ve yıllık fiyat gerekli' },
        { status: 400 }
      );
    }

    if (monthly_price <= 0 || yearly_price <= 0) {
      return NextResponse.json(
        { error: 'Fiyatlar 0\'dan büyük olmalıdır' },
        { status: 400 }
      );
    }

    // Fiyatları güncelle
    pricingData.monthly.price = parseFloat(monthly_price);
    pricingData.yearly.price = parseFloat(yearly_price);
    
    // İndirim oranını hesapla
    const discount = Math.round((1 - (yearly_price / (monthly_price * 12))) * 100);
    pricingData.yearly.discount = discount;

    console.log('Pricing updated:', pricingData);

    return NextResponse.json({ 
      message: 'Fiyatlar başarıyla güncellendi',
      pricing: pricingData,
      success: true
    });
  } catch (error: any) {
    console.error('Pricing POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Fiyat güncelleme hatası' }, 
      { status: 500 }
    );
  }
}
