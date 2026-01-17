'use client';

import { useEffect, useState } from 'react';
import { APP_VERSION } from '@/lib/version';

/**
 * Hook to detect version mismatches between client and server
 * Helps prevent deployment conflicts per Vercel recommendations
 * 
 * @returns {object} { needsReload: boolean, currentVersion: string, serverVersion: string | null }
 */
export function useVersionCheck() {
    const [needsReload, setNeedsReload] = useState(false);
    const [serverVersion, setServerVersion] = useState<string | null>(null);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const response = await fetch('/api/health');
                if (!response.ok) return;

                const data = await response.json();
                setServerVersion(data.version);

                // Check if server version differs from client version
                if (data.version && data.version !== APP_VERSION) {
                    console.warn(
                        '[Version Check] Mismatch detected:',
                        `Client: ${APP_VERSION}, Server: ${data.version}`
                    );
                    setNeedsReload(true);
                }
            } catch (error) {
                console.error('[Version Check] Failed:', error);
            }
        };

        // Check on mount
        checkVersion();

        // Check every 5 minutes
        const interval = setInterval(checkVersion, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        needsReload,
        currentVersion: APP_VERSION,
        serverVersion
    };
}

/**
 * Component to display version mismatch warning
 * Shows banner when client and server versions don't match
 */
export function VersionMismatchBanner() {
    const { needsReload } = useVersionCheck();

    if (!needsReload) return null;

    return (
        <div className= "fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg" >
        <div className="max-w-7xl mx-auto flex items-center justify-between" >
            <div className="flex items-center gap-3" >
                <svg className="w-6 h-6" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
                    <path strokeLinecap="round" strokeLinejoin = "round" strokeWidth = { 2} d = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        < div >
                        <p className="font-semibold" > Phiên bản mới có sẵn </p>
                            < p className = "text-sm" > Vui lòng tải lại trang để cập nhật phiên bản mới nhất.</p>
                                </div>
                                </div>
                                < button
    onClick = {() => window.location.reload()
}
className = "px-4 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
    >
    Tải lại ngay
        </button>
        </div>
        </div>
    );
}
