import { useState, useEffect } from 'react';

export interface ResponsiveInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  isOnline: boolean;
  width: number;
  height: number;
}

export function useResponsive(): ResponsiveInfo {
  const [screenInfo, setScreenInfo] = useState<ResponsiveInfo>(() => {
    const isClient = typeof window !== 'undefined';
    const width = isClient ? window.innerWidth : 1200;
    const height = isClient ? window.innerHeight : 800;
    const isTouchDevice = isClient && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const isOnline = isClient ? navigator.onLine : true;

    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isWide: width >= 1536,
      orientation: height > width ? 'portrait' : 'landscape',
      isTouchDevice,
      isOnline,
      width,
      height
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setScreenInfo(prev => ({
        ...prev,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isWide: width >= 1536,
        orientation: height > width ? 'portrait' : 'landscape',
        isTouchDevice,
        width,
        height
      }));
    };

    const handleOnline = () => setScreenInfo(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setScreenInfo(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return screenInfo;
}
