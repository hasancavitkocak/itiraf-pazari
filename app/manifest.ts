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
        src: '/android/android-launchericon-512-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android/android-launchericon-192-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android/android-launchericon-144-144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android/android-launchericon-96-96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android/android-launchericon-72-72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/android/android-launchericon-48-48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/ios/180.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/ios/152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/ios/120.png',
        sizes: '120x120',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/ios/76.png',
        sizes: '76x76',
        type: 'image/png',
        purpose: 'any'
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