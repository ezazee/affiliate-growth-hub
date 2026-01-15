"use client";

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  loadTime: number | null; // Page load time
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    loadTime: null,
  });

  useEffect(() => {
    // Only run in production and if browser supports performance API
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
      return;
    }

    const measurePerformance = () => {
      try {
        // Navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.requestStart;
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;

          // Largest Contentful Paint
          const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
          const lcp = lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : null;

          // First Contentful Paint
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          const fcp = fcpEntry ? fcpEntry.startTime : null;

          // Cumulative Layout Shift
          let clsValue = 0;
          const clsEntries = performance.getEntriesByType('layout-shift') as any[];
          clsEntries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });

          // First Input Delay
          const fidEntries = performance.getEntriesByType('first-input') as any[];
          const fid = fidEntries.length > 0 ? fidEntries[0].processingStart - fidEntries[0].startTime : null;

          setMetrics({
            fcp: fcp ? Math.round(fcp) : null,
            lcp: lcp ? Math.round(lcp) : null,
            fid: fid ? Math.round(fid) : null,
            cls: clsValue ? Math.round(clsValue * 1000) / 1000 : null,
            ttfb: ttfb ? Math.round(ttfb) : null,
            loadTime: loadTime ? Math.round(loadTime) : null,
          });

          // Log metrics for monitoring
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'performance_metrics', {
              fcp,
              lcp,
              fid,
              cls: clsValue,
              ttfb,
              loadTime,
            });
          }
        }
      } catch (error) {
        console.error('Error measuring performance:', error);
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      setTimeout(measurePerformance, 0);
    } else {
      window.addEventListener('load', () => {
        setTimeout(measurePerformance, 0);
      });
    }
  }, []);

  // Performance thresholds (good/needs improvement)
  const getPerformanceColor = (value: number | null, good: number, needsImprovement: number) => {
    if (value === null) return 'text-gray-500';
    if (value <= good) return 'text-green-600';
    if (value <= needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (process.env.NODE_ENV !== 'production') {
    return null; // Don't show in development
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs hidden lg:block">
      <div className="font-semibold mb-2">Performance Metrics</div>
      <div className="space-y-1">
        {metrics.ttfb !== null && (
          <div className="flex justify-between">
            <span>TTFB:</span>
            <span className={getPerformanceColor(metrics.ttfb, 600, 1000)}>
              {metrics.ttfb}ms
            </span>
          </div>
        )}
        {metrics.fcp !== null && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={getPerformanceColor(metrics.fcp, 1800, 3000)}>
              {metrics.fcp}ms
            </span>
          </div>
        )}
        {metrics.lcp !== null && (
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={getPerformanceColor(metrics.lcp, 2500, 4000)}>
              {metrics.lcp}ms
            </span>
          </div>
        )}
        {metrics.fid !== null && (
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={getPerformanceColor(metrics.fid, 100, 300)}>
              {metrics.fid}ms
            </span>
          </div>
        )}
        {metrics.cls !== null && (
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={getPerformanceColor(metrics.cls, 0.1, 0.25)}>
              {metrics.cls}
            </span>
          </div>
        )}
        {metrics.loadTime !== null && (
          <div className="flex justify-between">
            <span>Load:</span>
            <span className={getPerformanceColor(metrics.loadTime, 3000, 5000)}>
              {metrics.loadTime}ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}