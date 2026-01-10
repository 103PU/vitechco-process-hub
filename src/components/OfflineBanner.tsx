'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

interface OfflineBannerProps {
  isOnline: boolean;
  pendingSyncCount: number;
}

/**
 * OfflineBanner Component
 * 
 * Displays a dismissible warning banner when the app is offline.
 * Shows number of items pending sync.
 * Dismissal state persists in localStorage until next offline event.
 * 
 * @param isOnline - Current network status
 * @param pendingSyncCount - Number of items waiting to sync
 */
export function OfflineBanner({ isOnline, pendingSyncCount }: OfflineBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissal when going offline again
  useEffect(() => {
    if (!isOnline) {
      const wasDismissed = localStorage.getItem('offline-banner-dismissed');
      // Only load dismissal state if still offline since last dismissal
      if (wasDismissed === 'true') {
        setDismissed(true);
      }
    } else {
      // Clear dismissal when back online
      setDismissed(false);
      localStorage.removeItem('offline-banner-dismissed');
    }
  }, [isOnline]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('offline-banner-dismissed', 'true');
  };

  // Don't show if online or dismissed
  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div 
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-md"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <WifiOff 
            className="h-5 w-5 text-yellow-700 shrink-0" 
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-yellow-800">
              Không có kết nối mạng
            </p>
            {pendingSyncCount > 0 && (
              <p className="text-xs text-yellow-700 mt-0.5">
                {pendingSyncCount} thay đổi sẽ được đồng bộ khi có mạng trở lại
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-md hover:bg-yellow-100 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          aria-label="Đóng thông báo"
          type="button"
        >
          <X className="h-5 w-5 text-yellow-700 hover:text-yellow-900" />
        </button>
      </div>
    </div>
  );
}
