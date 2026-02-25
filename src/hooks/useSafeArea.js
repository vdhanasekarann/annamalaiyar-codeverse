import { useState, useEffect } from 'react';
import { getSafeAreaInsetTop } from '../utils/safeArea';

export const useSafeArea = () => {
  const [safeAreaTop, setSafeAreaTop] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSafeArea = () => {
      const insetTop = getSafeAreaInsetTop();
      setSafeAreaTop(insetTop);
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    updateSafeArea();
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(updateSafeArea, 100); // Small delay to ensure accurate measurements
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', updateSafeArea);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return {
    safeAreaTop,
    isMobile,
    topPadding: safeAreaTop,
    headerHeight: 64 + safeAreaTop, // 4rem = 64px
    shouldUseSafeArea: safeAreaTop > 0
  };
};
