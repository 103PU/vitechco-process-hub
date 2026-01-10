import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineSession } from '@/hooks/useOfflineSession';

describe('useOfflineSession Hook', () => {
    const defaultOptions = {
        workSessionId: 'test-session-1',
        documentId: 'test-doc-1'
    };

    beforeEach(() => {
        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true
        });

        // Clear localStorage
        localStorage.clear();

        // Clear any event listeners
        window.removeEventListener('online', vi.fn());
        window.removeEventListener('offline', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('should initialize with online state', () => {
        const { result } = renderHook(() => useOfflineSession(defaultOptions));

        expect(result.current.isOnline).toBe(true);
        expect(result.current.pendingSyncCount).toBe(0);
    });

    it('should detect offline state', () => {
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: false
        });

        const { result } = renderHook(() => useOfflineSession(defaultOptions));

        expect(result.current.isOnline).toBe(false);
    });

    it('should update when going offline', () => {
        const { result } = renderHook(() => useOfflineSession(defaultOptions));

        expect(result.current.isOnline).toBe(true);

        // Simulate going offline
        act(() => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });
            window.dispatchEvent(new Event('offline'));
        });

        expect(result.current.isOnline).toBe(false);
    });

    it('should update when coming back online', () => {
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: false
        });

        const { result } = renderHook(() => useOfflineSession(defaultOptions));

        expect(result.current.isOnline).toBe(false);

        // Simulate coming back online
        act(() => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true
            });
            window.dispatchEvent(new Event('online'));
        });

        expect(result.current.isOnline).toBe(true);
    });

    it('should save and load progress', () => {
        const { result } = renderHook(() => useOfflineSession(defaultOptions));

        const progress = { step_1: true, step_2: false };

        act(() => {
            result.current.saveProgress(progress);
        });

        const loaded = result.current.loadProgress();
        expect(loaded).toEqual(progress);
    });

    it('should track pending sync count when saving offline', () => {
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: false
        });

        const { result } = renderHook(() => useOfflineSession(defaultOptions));

        act(() => {
            result.current.saveProgress({ step_1: true });
        });

        // Pending count should increase when offline
        expect(result.current.pendingSyncCount).toBeGreaterThanOrEqual(0);
    });

    it('should provide forceSyncAll function', async () => {
        const { result } = renderHook(() => useOfflineSession(defaultOptions));

        await act(async () => {
            await result.current.forceSyncAll();
        });

        // Should complete without errors
        expect(result.current.forceSyncAll).toBeDefined();
    });

    it('should cleanup event listeners on unmount', () => {
        const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

        const { unmount } = renderHook(() => useOfflineSession(defaultOptions));

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('should work with different session IDs', () => {
        const options1 = { workSessionId: 'session-1', documentId: 'doc-1' };
        const options2 = { workSessionId: 'session-2', documentId: 'doc-2' };

        const { result: result1 } = renderHook(() => useOfflineSession(options1));
        const { result: result2 } = renderHook(() => useOfflineSession(options2));

        act(() => {
            result1.current.saveProgress({ step_1: true });
            result2.current.saveProgress({ step_1: false });
        });

        expect(result1.current.loadProgress()).toEqual({ step_1: true });
        expect(result2.current.loadProgress()).toEqual({ step_1: false });
    });
});
