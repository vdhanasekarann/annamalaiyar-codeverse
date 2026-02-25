/**
 * Safe area utilities for mobile status bar handling
 */

export const getSafeAreaInsetTop = () => {
  // For mobile apps with safe area support
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const testElement = document.createElement('div');
    testElement.style.position = 'fixed';
    testElement.style.top = '0';
    testElement.style.left = '0';
    testElement.style.right = '0';
    testElement.style.height = 'env(safe-area-inset-top, 1px)';
    testElement.style.paddingTop = 'env(safe-area-inset-top, 0px)';
    testElement.style.visibility = 'hidden';
    testElement.style.pointerEvents = 'none';
    
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const paddingTop = computedStyle.paddingTop;
    
    document.body.removeChild(testElement);
    
    // Extract the pixel value from the computed style
    if (paddingTop && paddingTop !== '0px') {
      return parseFloat(paddingTop);
    }
  }
  
  // Fallback for common mobile status bar heights
  if (typeof window !== 'undefined') {
    const userAgent = navigator.userAgent;
    
    // iOS devices typically have taller status bars
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      // Check if it's an iPhone with notch
      if (/iPhone/.test(userAgent) && window.screen.height >= 812) {
        return 44; // iPhone X and later with notch
      }
      return 20; // Older iPhones
    }
    
    // Android devices
    if (/Android/.test(userAgent)) {
      return 24; // Common Android status bar height
    }
  }
  
  return 0; // Desktop or unknown device
};

export const applySafeAreaPadding = (element) => {
  if (!element) return;
  
  const insetTop = getSafeAreaInsetTop();
  if (insetTop > 0) {
    element.style.paddingTop = `${insetTop}px`;
    element.style.height = `calc(4rem + ${insetTop}px)`;
  }
};
