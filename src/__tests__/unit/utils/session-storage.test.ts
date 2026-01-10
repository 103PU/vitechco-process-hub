import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionStateManager } from '@/lib/utils/session-storage';

describe('SessionStateManager', () => {
    let manager: SessionStateManager;
    const storageKey = 'test-session';

    beforeEach(() => {
        // Clear sessionStorage before each test
        sessionStorage.clear();
        manager = new SessionStateManager();
    });

    afterEach(() => {
        sessionStorage.clear();
    });

    describe('save and load progress', () => {
        it('should save and load checklist progress', () => {
            const state = {
                workSessionId: 'session-1',
                documentId: 'doc-1',
                progress: { step_1: true, step_2: false },
                lastUpdated: Date.now()
            };

            manager.saveProgress(state);
            const loaded = manager.loadProgress('session-1');

            expect(loaded).toEqual(state);
        });

        it('should return null when no state exists', () => {
            const loaded = manager.loadProgress('non-existent');
            expect(loaded).toBeNull();
        });

        it('should overwrite existing state', () => {
            const state1 = {
                workSessionId: 'session-1',
                documentId: 'doc-1',
                progress: { step_1: true },
                lastUpdated: Date.now()
            };
            const state2 = {
                workSessionId: 'session-1',
                documentId: 'doc-1',
                progress: { step_1: true, step_2: true },
                lastUpdated: Date.now()
            };

            manager.saveProgress(state1);
            manager.saveProgress(state2);

            const loaded = manager.loadProgress('session-1');
            expect(loaded?.progress).toEqual({ step_1: true, step_2: true });
        });
    });

    describe('clear', () => {
        it('should clear saved state', () => {
            const state = {
                workSessionId: 'session-1',
                documentId: 'doc-1',
                progress: { step_1: true },
                lastUpdated: Date.now()
            };

            manager.saveProgress(state);
            manager.clearProgress('session-1');

            const loaded = manager.loadProgress('session-1');
            expect(loaded).toBeNull();
        });

        it('should handle clearing non-existent state', () => {
            manager.clearProgress('non-existent');
            const loaded = manager.loadProgress('non-existent');
            expect(loaded).toBeNull();
        });
    });

    describe('error handling', () => {
        it('should handle corrupted JSON', () => {
            sessionStorage.setItem('work_session_session-1', 'invalid json {]');
            const loaded = manager.loadProgress('session-1');
            expect(loaded).toBeNull();
        });

        it('should handle sessionStorage errors gracefully', () => {
            // Mock sessionStorage to throw error
            const originalSetItem = sessionStorage.setItem;
            sessionStorage.setItem = vi.fn(() => {
                throw new Error('Quota exceeded');
            });

            const state = {
                workSessionId: 'session-1',
                documentId: 'doc-1',
                progress: { step_1: true },
                lastUpdated: Date.now()
            };

            expect(() => manager.saveProgress(state)).not.toThrow();

            sessionStorage.setItem = originalSetItem;
        });
    });

    describe('multiple instances', () => {
        it('should handle multiple sessions with different IDs', () => {
            const state1 = {
                workSessionId: 'session-1',
                documentId: 'doc-1',
                progress: { step_1: true },
                lastUpdated: Date.now()
            };
            const state2 = {
                workSessionId: 'session-2',
                documentId: 'doc-2',
                progress: { step_1: false },
                lastUpdated: Date.now()
            };

            manager.saveProgress(state1);
            manager.saveProgress(state2);

            expect(manager.loadProgress('session-1')?.progress).toEqual({ step_1: true });
            expect(manager.loadProgress('session-2')?.progress).toEqual({ step_1: false });
        });
    });
});
