'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSessionStateManager, ChecklistProgressState } from '@/lib/utils/session-storage';

interface UseOfflineSessionOptions {
    workSessionId: string;
    documentId: string;
}

/**
 * React Hook for Offline Session Support
 * 
 * Handles automatic saving of checklist progress to localStorage
 * and syncing to server when connection is restored.
 * 
 * @example
 * const { saveProgress, isOnline, pendingSyncCount } = useOfflineSession({
 *   workSessionId: 'session-id',
 *   documentId: 'doc-id',
 * });
 * 
 * // Save progress when user checks an item
 * saveProgress({ step_1: true, step_2: false });
 */
export function useOfflineSession({ workSessionId, documentId }: UseOfflineSessionOptions) {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingSyncCount, setPendingSyncCount] = useState(0);
    const [manager] = useState(() => getSessionStateManager());

    // Update online status
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const updateStatus = () => {
            setIsOnline(navigator.onLine);
            setPendingSyncCount(manager.getPendingSyncCount());
        };

        updateStatus();

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, [manager]);

    // Load initial progress
    const loadProgress = useCallback((): Record<string, boolean> | null => {
        const state = manager.loadProgress(workSessionId);
        return state?.progress || null;
    }, [manager, workSessionId]);

    // Save progress
    const saveProgress = useCallback((progress: Record<string, boolean>) => {
        const state: ChecklistProgressState = {
            workSessionId,
            documentId,
            progress,
            lastUpdated: Date.now(),
        };

        manager.saveProgress(state);
        setPendingSyncCount(manager.getPendingSyncCount());
    }, [manager, workSessionId, documentId]);

    // Force sync all pending items
    const forceSyncAll = useCallback(async () => {
        await manager.forceSyncAll();
        setPendingSyncCount(manager.getPendingSyncCount());
    }, [manager]);

    return {
        isOnline,
        pendingSyncCount,
        saveProgress,
        loadProgress,
        forceSyncAll,
    };
}
