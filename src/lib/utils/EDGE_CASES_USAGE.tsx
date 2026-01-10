/* 
 * EDGE CASES IMPLEMENTATION - USAGE EXAMPLES
 * Demonstrates how to use the new utilities and hooks
 */

import { ClientOnly } from '@/components/ClientOnly';
import { useOfflineSession } from '@/hooks/useOfflineSession';
import { normalizeVietnamese, containsVietnamese } from '@/lib/utils/vietnamese-text';

// ================================================================
// 1. HYDRATION ERROR FIX - ClientOnly Component
// ================================================================

// ❌ BEFORE: Causes hydration error
function BadDateDisplay() {
    return <div>{new Date().toLocaleString()}</div>;
}

// ✅ AFTER: No hydration error
function GoodDateDisplay() {
    return (
        <ClientOnly fallback={<div>Loading...</div>}>
            <div>{new Date().toLocaleString()}</div>
        </ClientOnly>
    );
}

// ================================================================
// 2. VIETNAMESE SEARCH - Text Normalization
// ================================================================

// Example: Normalize search queries
const query1 = "Máy photocopy Ricoh";
const normalized1 = normalizeVietnamese(query1);
console.log(normalized1); // "May photocopy Ricoh"

// Example: Check if text contains Vietnamese query
const text = "Hướng dẫn sử dụng máy MPC 3004";
const hasMatch = containsVietnamese(text, "may"); // true (matches "máy")

// ================================================================
// 3. OFFLINE SESSION - Checklist Progress
// ================================================================

function ChecklistComponent() {
    const {
        saveProgress,
        loadProgress,
        isOnline,
        pendingSyncCount
    } = useOfflineSession({
        workSessionId: 'session-123',
        documentId: 'doc-456',
    });

    const handleCheckboxChange = (stepId: string, checked: boolean) => {
        // Load current progress
        const current = loadProgress() || {};

        // Update progress
        const updated = { ...current, [stepId]: checked };

        // Save (will auto-sync if online, queue if offline)
        saveProgress(updated);
    };

    return (
        <div>
            {/* Show connection status */}
            {!isOnline && (
                <div className="bg-yellow-100 p-2">
                    ⚠️ Offline - {pendingSyncCount} items will sync when reconnected
                </div>
            )}

            {/* Checklist items */}
            <label>
                <input
                    type="checkbox"
                    onChange={(e) => handleCheckboxChange('step_1', e.target.checked)}
                />
                Step 1: Clean photocopy drum
            </label>
        </div>
    );
}

// ================================================================
// 4. API ENDPOINT - Session Sync
// ================================================================

// Endpoint: POST /api/sessions/sync
// Body: { workSessionId, documentId, progress }

// Example API call (automatic via useOfflineSession hook):
async function manualSyncExample() {
    const response = await fetch('/api/sessions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            workSessionId: 'session-123',
            documentId: 'doc-456',
            progress: {
                step_1: true,
                step_2: false,
                step_3: true,
            },
        }),
    });

    const result = await response.json();
    console.log(result); // { success: true }
}

// ================================================================
// 5. SEARCH API - Vietnamese Support
// ================================================================

// The search API now automatically normalizes Vietnamese queries
// Both of these will return the same results:

// Search with diacritics
// GET /api/search?q=Máy%20photocopy

// Search without diacritics (will still match "Máy photocopy")
// GET /api/search?q=May%20photocopy

export { };
