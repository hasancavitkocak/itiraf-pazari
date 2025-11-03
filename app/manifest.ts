import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'İtiraf Pazarı - Anonim İtiraf Platformu',
    short_name: 'İtiraf Pazarı',
    description: 'Türkiye\'nin en güvenli anonim itiraf paylaşım platformu',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    orientation: 'portrait',
    categories: ['social', 'lifestyle'],
    lang: 'tr',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      }
    ],
    shortcuts: [
      {
        name: 'Yeni İtiraf',
        short_name: 'Yeni İtiraf',
        description: 'Hızlıca yeni itiraf paylaş',
        url: '/?new=true'
      },
      {
        name: 'Popüler İtiraflar',
        short_name: 'Popüler',
        description: 'En popüler itirafları gör',
        url: '/?sort=popular'
      }
    ]
  }
}