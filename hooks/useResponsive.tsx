import { useState, useEffect } from 'react';

interface ScreenSize {
  width: number;
  height: number;
}

interface ResponsiveConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  scale: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export const useResponsive = (): ResponsiveConfig => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({ width: 0, height: 0 });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    updateScreenSize();

    // Add event listener with throttling for performance
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 100);
    };

    window.addEventListener('resize', throttledResize);
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  };

  const isMobile = screenSize.width < breakpoints.mobile;
  const isTablet = screenSize.width >= breakpoints.mobile && screenSize.width < breakpoints.tablet;
  const isDesktop = screenSize.width >= breakpoints.tablet;

  // Calculate responsive scale factor based on screen width
  const getScale = () => {
    const baseWidth = 1024; // Base design width
    const scaleFactor = Math.min(screenSize.width / baseWidth, 1);
    return Math.max(0.3, scaleFactor); // Minimum scale of 0.3 for very small screens
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    scale: getScale(),
    breakpoints,
  };
};

// Utility functions for common responsive patterns
export const getResponsiveSize = (mobileSize: number, tabletSize?: number, desktopSize?: number) => {
  return (scale: number, isMobile: boolean, isTablet: boolean) => {
    if (isMobile) return mobileSize * scale;
    if (isTablet) return (tabletSize || mobileSize * 1.2) * scale;
    return (desktopSize || tabletSize || mobileSize * 1.5) * scale;
  };
};

export const getResponsiveSpacing = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return { padding: '8px', margin: '4px', gap: '8px' };
  if (isTablet) return { padding: '12px', margin: '6px', gap: '12px' };
  return { padding: '16px', margin: '8px', gap: '16px' };
};

export const getResponsiveFontSize = (isMobile: boolean, isTablet: boolean) => {
  return {
    xs: isMobile ? 'text-xs' : 'text-sm',
    sm: isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg',
    md: isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-xl',
    lg: isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl',
    xl: isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-3xl',
  };
};
