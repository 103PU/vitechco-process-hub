/*
 * OFFLINE BANNER - USAGE EXAMPLE
 * Demonstrates how to use the OfflineBanner component
 */

import React, { useState, useEffect } from 'react';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useOfflineSession } from '@/hooks/useOfflineSession';

// Example 1: Basic usage with offline hook
function MyPage() {
  const { isOnline, pendingSyncCount } = useOfflineSession({
    workSessionId: 'session-123',
    documentId: 'doc-456'
  });

  return (
    <div>
      {/* Show banner when offline */}
      <OfflineBanner 
        isOnline={isOnline}
        pendingSyncCount={pendingSyncCount}
      />
      
      {/* Rest of your page content */}
      <div className="container">
        <h1>My Page</h1>
        {/* ... */}
      </div>
    </div>
  );
}

// Example 2: Global banner in layout
function RootLayout({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <html>
      <body>
        {/* Global offline banner */}
        <OfflineBanner 
          isOnline={isOnline}
          pendingSyncCount={pendingCount}
        />
        
        <main>{children}</main>
      </body>
    </html>
  );
}

// Example 3: Sticky banner at top
function App() {
  const { isOnline, pendingSyncCount } = useOfflineSession({
    workSessionId: 'example',
    documentId: 'example'
  });

  return (
    <div className="min-h-screen">
      {/* Sticky banner */}
      <div className="sticky top-0 z-50">
        <OfflineBanner 
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto">
        {/* ... */}
      </div>
    </div>
  );
}

export {};
