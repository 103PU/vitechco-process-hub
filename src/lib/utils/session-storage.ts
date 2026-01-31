/**
 * Session State Manager - Offline Support for Work Sessions
 * 
 * Handles localStorage persistence of checklist progress during network outages.
 * Automatically syncs to server when connection is restored.
 */

export interface ChecklistProgressState {
    workSessionId: string;
    documentId: string;
    progress: Record<string, boolean>; // { "step_1": true, "step_2": false }
    lastUpdated: number; // timestamp
}

export interface SyncQueueItem {
    workSessionId: string;
    documentId: string;
    progress: Record<string, boolean>;
    timestamp: number;
    retryCount: number;
}

const STORAGE_KEY_PREFIX = 'work_session_';
const SYNC_QUEUE_KEY = 'sync_queue';
const MAX_RETRY = 3;

/**
 * SessionStateManager - Manager for offline session state persistence
 */
export class SessionStateManager {
    private syncQueue: SyncQueueItem[] = [];
    private isOnline: boolean = true;
    private syncInProgress: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.isOnline = navigator.onLine;
            this.loadSyncQueue();
            this.setupOnlineListener();
        }
    }

    /**
     * Save checklist progress to localStorage
     */
    saveProgress(state: ChecklistProgressState): void {
        if (typeof window === 'undefined') return;

        const key = `${STORAGE_KEY_PREFIX}${state.workSessionId}`;

        try {
            localStorage.setItem(key, JSON.stringify(state));
            console.log('[SessionStateManager] Progress saved locally:', state.workSessionId);

            // If online, try to sync immediately
            if (this.isOnline) {
                this.syncToServer(state);
            } else {
                // If offline, add to sync queue
                this.addToSyncQueue(state);
            }
        } catch (error) {
            console.error('[SessionStateManager] Failed to save progress:', error);
        }
    }

    /**
     * Load checklist progress from localStorage
     */
    loadProgress(workSessionId: string): ChecklistProgressState | null {
        if (typeof window === 'undefined') return null;

        const key = `${STORAGE_KEY_PREFIX}${workSessionId}`;

        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;

            return JSON.parse(stored);
        } catch (error) {
            console.error('[SessionStateManager] Failed to load progress:', error);
            return null;
        }
    }

    /**
     * Clear progress from localStorage (after successful server sync)
     */
    clearProgress(workSessionId: string): void {
        if (typeof window === 'undefined') return;

        const key = `${STORAGE_KEY_PREFIX}${workSessionId}`;
        localStorage.removeItem(key);
        console.log('[SessionStateManager] Progress cleared:', workSessionId);
    }

    /**
     * Add item to sync queue for later upload
     */
    private addToSyncQueue(state: ChecklistProgressState): void {
        const queueItem: SyncQueueItem = {
            workSessionId: state.workSessionId,
            documentId: state.documentId,
            progress: state.progress,
            timestamp: state.lastUpdated,
            retryCount: 0,
        };

        // Check if item already in queue, update it
        const existingIndex = this.syncQueue.findIndex(
            item => item.workSessionId === state.workSessionId
        );

        if (existingIndex >= 0) {
            this.syncQueue[existingIndex] = queueItem;
        } else {
            this.syncQueue.push(queueItem);
        }

        this.saveSyncQueue();
        console.log('[SessionStateManager] Added to sync queue:', state.workSessionId);
    }

    /**
     * Sync progress to server
     */
    private async syncToServer(state: ChecklistProgressState): Promise<boolean> {
        try {
            const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
            const baseUrl = (typeof window === 'undefined' || isTest)
                ? (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
                : '';

            const response = await fetch(`${baseUrl}/api/sessions/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workSessionId: state.workSessionId,
                    documentId: state.documentId,
                    progress: state.progress,
                }),
            });

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.status}`);
            }

            console.log('[SessionStateManager] Synced to server:', state.workSessionId);

            // Clear from localStorage after successful sync
            this.clearProgress(state.workSessionId);

            return true;
        } catch (error) {
            console.error('[SessionStateManager] Sync to server failed:', error);

            // Add to queue for retry if offline
            if (!this.isOnline) {
                this.addToSyncQueue(state);
            }

            return false;
        }
    }

    /**
     * Process sync queue - upload all pending items
     */
    private async processSyncQueue(): Promise<void> {
        if (this.syncInProgress || this.syncQueue.length === 0) {
            return;
        }

        this.syncInProgress = true;
        console.log(`[SessionStateManager] Processing ${this.syncQueue.length} queued items...`);

        const itemsToSync = [...this.syncQueue];

        for (const item of itemsToSync) {
            if (item.retryCount >= MAX_RETRY) {
                console.warn('[SessionStateManager] Max retry reached, removing item:', item.workSessionId);
                this.removeFromQueue(item.workSessionId);
                continue;
            }

            const success = await this.syncToServer({
                workSessionId: item.workSessionId,
                documentId: item.documentId,
                progress: item.progress,
                lastUpdated: item.timestamp,
            });

            if (success) {
                this.removeFromQueue(item.workSessionId);
            } else {
                // Increment retry count
                item.retryCount++;
                this.saveSyncQueue();
            }
        }

        this.syncInProgress = false;
    }

    /**
     * Remove item from sync queue
     */
    private removeFromQueue(workSessionId: string): void {
        this.syncQueue = this.syncQueue.filter(
            item => item.workSessionId !== workSessionId
        );
        this.saveSyncQueue();
    }

    /**
     * Save sync queue to localStorage
     */
    private saveSyncQueue(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('[SessionStateManager] Failed to save sync queue:', error);
        }
    }

    /**
     * Load sync queue from localStorage
     */
    private loadSyncQueue(): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(SYNC_QUEUE_KEY);
            if (stored) {
                this.syncQueue = JSON.parse(stored);
                console.log(`[SessionStateManager] Loaded ${this.syncQueue.length} items from queue`);
            }
        } catch (error) {
            console.error('[SessionStateManager] Failed to load sync queue:', error);
            this.syncQueue = [];
        }
    }

    /**
     * Setup listener for online/offline events
     */
    private setupOnlineListener(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('online', () => {
            console.log('[SessionStateManager] Connection restored');
            this.isOnline = true;
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            console.log('[SessionStateManager] Connection lost');
            this.isOnline = false;
        });
    }

    /**
     * Get connection status
     */
    getConnectionStatus(): boolean {
        return this.isOnline;
    }

    /**
     * Get number of items in sync queue
     */
    getPendingSyncCount(): number {
        return this.syncQueue.length;
    }

    /**
     * Manually trigger sync (useful for testing)
     */
    async forceSyncAll(): Promise<void> {
        await this.processSyncQueue();
    }
}

// Singleton instance
let managerInstance: SessionStateManager | null = null;

/**
 * Get singleton instance of SessionStateManager
 */
export function getSessionStateManager(): SessionStateManager {
    if (!managerInstance) {
        managerInstance = new SessionStateManager();
    }
    return managerInstance;
}
