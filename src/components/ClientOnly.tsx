'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * ClientOnly Component
 * 
 * Wraps content that should only render on the client side,
 * preventing hydration mismatches between server and client.
 * 
 * Use cases:
 * - Rendering dates/times that differ between server and client
 * - Browser-only APIs (localStorage, window, etc.)
 * - Dynamic content that changes based on client state
 * 
 * @example
 * <ClientOnly fallback={<Skeleton />}>
 *   <div>{new Date().toLocaleString()}</div>
 * </ClientOnly>
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
