import React from 'react';
import { useSafeArea } from '../hooks/useSafeArea';

export default function SafeAreaTest() {
  const { safeAreaTop, isMobile, headerHeight, shouldUseSafeArea } = useSafeArea();

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
      <div className="space-y-1">
        <div><strong>Safe Area Top:</strong> {safeAreaTop}px</div>
        <div><strong>Is Mobile:</strong> {isMobile ? 'Yes' : 'No'}</div>
        <div><strong>Header Height:</strong> {headerHeight}px</div>
        <div><strong>Use Safe Area:</strong> {shouldUseSafeArea ? 'Yes' : 'No'}</div>
        <div><strong>User Agent:</strong> {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
      </div>
    </div>
  );
}
