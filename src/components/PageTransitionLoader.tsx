'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LogoLoading from './LogoLoading';

function PageTransitionLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // When pathname or searchParams change, hide loading
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // Global click interception on internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external links, anchor hashes, javascript:, mailto:, tel:, or new tab clicks
      if (
        target.target === '_blank' ||
        target.hasAttribute('download') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check destination URL
      try {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(href, window.location.href);

        // If target points to exact same route and search params, do not show loader
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search
        ) {
          return;
        }

        // Show page transition loading screen!
        setIsLoading(true);
      } catch {
        // invalid URL ignore
      }
    };

    // Manual custom events
    const handleStart = () => setIsLoading(true);
    const handleStop = () => setIsLoading(false);

    document.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('supermalazz-loading-start', handleStart);
    window.addEventListener('supermalazz-loading-stop', handleStop);

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('supermalazz-loading-start', handleStart);
      window.removeEventListener('supermalazz-loading-stop', handleStop);
    };
  }, []);

  // Safety fallback timeout to prevent infinite stuck loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return <LogoLoading message="Memuat Halaman..." subMessage="Tongkrongan SuperMalazz" />;
}

export default function PageTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <PageTransitionLoaderInner />
    </Suspense>
  );
}
