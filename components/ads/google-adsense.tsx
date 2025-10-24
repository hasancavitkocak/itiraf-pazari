'use client';

import { useEffect } from 'react';

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export function GoogleAdSense({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = { display: 'block' }
}: GoogleAdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive}
    />
  );
}

// Farklı reklam boyutları için hazır bileşenler
export function BannerAd() {
  return (
    <div className="my-4 text-center">
      <GoogleAdSense
        adSlot="1234567890" // AdSense'den alacağınız slot ID
        style={{ display: 'block', width: '100%', height: '90px' }}
      />
    </div>
  );
}

export function SquareAd() {
  return (
    <div className="my-4 text-center">
      <GoogleAdSense
        adSlot="0987654321" // AdSense'den alacağınız slot ID
        style={{ display: 'block', width: '300px', height: '250px' }}
      />
    </div>
  );
}

export function InFeedAd() {
  return (
    <div className="my-6">
      <GoogleAdSense
        adSlot="1122334455" // AdSense'den alacağınız slot ID
        adFormat="fluid"
        style={{ display: 'block' }}
      />
    </div>
  );
}