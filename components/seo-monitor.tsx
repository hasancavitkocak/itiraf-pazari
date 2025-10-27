'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export function SEOMonitor() {
  const pathname = usePathname()

  useEffect(() => {
    // Google Analytics sayfa görüntüleme tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.href,
      })

      // Custom events for SEO tracking
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pathname,
      })
    }

    // Core Web Vitals tracking
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            event_category: 'Web Vitals',
          })
        }
      })
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(entry.processingStart - entry.startTime),
              event_category: 'Web Vitals',
            })
          }
        })
      })
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Web Vitals',
          })
        }
      })
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        // CLS not supported
      }
    }

    // SEO health check
    const performSEOHealthCheck = () => {
      const checks = {
        hasTitle: !!document.title,
        hasMetaDescription: !!document.querySelector('meta[name="description"]'),
        hasCanonical: !!document.querySelector('link[rel="canonical"]'),
        hasOGTags: !!document.querySelector('meta[property^="og:"]'),
        hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
        hasH1: !!document.querySelector('h1'),
        titleLength: document.title.length,
        metaDescLength: document.querySelector('meta[name="description"]')?.getAttribute('content')?.length || 0,
      }

      // Log SEO health to analytics
      if (window.gtag) {
        window.gtag('event', 'seo_health_check', {
          event_category: 'SEO',
          custom_parameter_1: JSON.stringify(checks),
        })
      }

      // Development mode warnings
      if (process.env.NODE_ENV === 'development') {
        console.group('🔍 SEO Health Check')
        console.log('Title:', checks.hasTitle ? '✅' : '❌', document.title)
        console.log('Meta Description:', checks.hasMetaDescription ? '✅' : '❌')
        console.log('Canonical URL:', checks.hasCanonical ? '✅' : '❌')
        console.log('Open Graph Tags:', checks.hasOGTags ? '✅' : '❌')
        console.log('Structured Data:', checks.hasStructuredData ? '✅' : '❌')
        console.log('H1 Tag:', checks.hasH1 ? '✅' : '❌')
        console.log('Title Length:', checks.titleLength, checks.titleLength > 60 ? '⚠️ Too long' : '✅')
        console.log('Meta Desc Length:', checks.metaDescLength, checks.metaDescLength > 160 ? '⚠️ Too long' : '✅')
        console.groupEnd()
      }
    }

    // Run health check after page load
    setTimeout(performSEOHealthCheck, 1000)

  }, [pathname])

  return null
}