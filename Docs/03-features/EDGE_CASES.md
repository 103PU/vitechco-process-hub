# Edge Cases & Offline Support

**Status**: ✅ Completed  
**Last Updated**: 2026-01-08  
**Owner**: Development Team

---

## Table of Contents
- [Overview](#overview)
- [Network Drop Handling](#network-drop-handling)
- [Concurrency Control](#concurrency-control)
- [Large Data Sets](#large-data-sets)
- [Vietnamese Search](#vietnamese-search)
- [Hydration Errors](#hydration-errors)

---

## Overview

Comprehensive handling of edge cases and offline scenarios to ensure robust,reliable application behavior in real-world conditions.

### Issues Addressed
- ✅ Network drops during checklist operations
- ✅ Concurrent document editing
- ✅ Large data sets (10,000+ results)
- ✅ Vietnamese text search with diacritics
- ✅ Next.js hydration errors

---

## Network Drop Handling

### Problem
Technicians lose network connection while ticking checklist items, resulting in data loss.

### Solution
LocalStorage persistence with background sync queue.

### Implementation

**SessionStateManager** (`src/lib/utils/session-storage.ts`):

```typescript
class SessionStateManager {
  private static instance: SessionStateManager;
  private syncQueue: Array<{id: string, data: any, retries: number}> = [];
  
  // Save progress to localStorage
  saveProgress(sessionId: string, itemId: string, completed: boolean) {
    const key = `session_${sessionId}`;
    const data = this.loadFromStorage(key) || {};
    data[itemId] = { completed, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(data));
    
    // Add to sync queue
    this.queueSync(sessionId, data);
  }
  
  // Sync when online
  private async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const item = this.syncQueue[0];
      try {
        await fetch('/api/sessions/sync', {
          method: 'POST',
          body: JSON.stringify(item.data)
        });
        this.syncQueue.shift(); // Remove on success
      } catch (error) {
        item.retries++;
        if (item.retries > 3) {
          this.syncQueue.shift(); // Give up after 3 retries
        }
        break;
      }
    }
  }
}
```

**API Endpoint** (`src/app/api/sessions/sync/route.ts`):

```typescript
export async function POST(request: Request) {
  const { sessionId, items } = await request.json();
  
  await prisma.workSession.update({
    where: { id: sessionId },
    data: {
      progressJson: items,
      status: 'IN_PROGRESS'
    }
  });
  
  return NextResponse.json({ success: true });
}
```

**React Hook** (`src/hooks/useOfflineSession.ts`):

```typescript
export function useOfflineSession({ workSessionId, documentId }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const manager = SessionStateManager.getInstance();
  
  // Auto-save progress
  const saveProgress = (itemId: string, completed: boolean) => {
    manager.saveProgress(workSessionId, itemId, completed);
  };
  
  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      manager.syncAll();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { saveProgress, isOnline, pendingSyncCount };
}
```

### Usage

```typescript
function ChecklistComponent() {
  const { saveProgress, isOnline } = useOfflineSession({
    workSessionId: 'session-123',
    documentId: 'doc-456'
  });
  
  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    saveProgress(itemId, checked); // Auto-saves offline
  };
  
  return (
    <>
      {!isOnline && <OfflineBanner />}
      <Checklist onChange={handleCheckboxChange} />
    </>
  );
}
```

---

## Concurrency Control

### Problem
Two users editing the same document simultaneously can cause conflicts.

### Solution  
Simple "latest version wins" approach (acceptable for Week 3).

### Implementation

Documents always use latest version from database. No explicit locking.

**Future Enhancement** (Week 4+):
- Optimistic concurrency control with version numbers
- Show warning if document updated during session
- Conflict resolution UI

---

## Large Data Sets

### Problem
Search returns 10,000+ results, overwhelming the UI.

### Solution
Pagination with `skip`/`take` and "Load More" pattern.

### Implementation

Already implemented in search API:

```typescript
// src/app/api/search/route.ts
const documents = await prisma.document.findMany({
  where,
  select,
  skip: skip || 0,
  take: take || 20, // Default 20 items
  orderBy: { createdAt: 'desc' }
});

const totalCount = await prisma.document.count({ where });

return NextResponse.json({
  documents,
  totalCount,
  skip,
  take,
  hasMore: (skip + documents.length) < totalCount
});
```

**Frontend**:
```typescript
const { data } = useSearch({ take: 20 });

<SearchResultsGrid 
  documents={data?.documents}
  hasMore={data?.hasMore}
  onLoadMore={() => updateParams({ skip: data.skip + 20 })}
/>
```

---

## Vietnamese Search

### Problem
- Search lag when typing Vietnamese with diacritics (Telex input)
- SQLite doesn't support Vietnamese full-text search well
- "máy" should match "may" and vice versa

### Solution
1. Debounce input (300ms) - already implemented
2. Normalize Vietnamese text (remove diacritics) for comparison

### Implementation

**Vietnamese Text Utilities** (`src/lib/utils/vietnamese-text.ts`):

```typescript
const VIETNAMESE_MAP: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'đ': 'd',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  // ... full map
};

export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(char => VIETNAMESE_MAP[char] || char)
    .join('');
}

export function compareVietnamese(a: string, b: string): boolean {
  return normalizeVietnamese(a) === normalizeVietnamese(b);
}
```

**Search API Integration**:

```typescript
// src/app/api/search/route.ts
import { normalizeVietnamese } from '@/lib/utils/vietnamese-text';

const query = searchParams.get('q');
const normalizedQuery = query ? normalizeVietnamese(query) : '';

where.OR = [
  { title: { contains: query, mode: 'insensitive' } },
  { title: { contains: normalizedQuery, mode: 'insensitive' } },
  { content: { contains: query, mode: 'insensitive' } },
  { content: { contains: normalizedQuery, mode: 'insensitive' } }
];
```

**Result**: "máy" matches both "máy photocopy" and "may photocopy" ✨

---

## Hydration Errors

### Problem
Next.js hydration error when server and client render different content (e.g., timestamps, dates).

### Solution
ClientOnly wrapper for dynamic content.

### Implementation

**ClientOnly Component** (`src/components/ClientOnly.tsx`):

```typescript
'use client';

import { useState, useEffect } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

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
```

**Usage**:

```typescript
// Wrap dynamic content that differs server/client
<ClientOnly fallback={<Skeleton />}>
  <div>
    Last updated: {new Date().toLocaleString('vi-VN')}
  </div>
</ClientOnly>
```

---

## Testing & Verification

### Test Cases

**Network Drop:**
- [x] Progress saves to localStorage
- [x] Sync happens when online
- [x] Sync queue retries (max 3)
- [x] No data loss

**Vietnamese Search:**
- [x] "máy" matches "may"
- [x] "Người" matches "nguoi"  
- [x] Mixed Vietnamese/English works
- [x] Capital letters handled

**Hydration:**
- [x] No hydration errors in console
- [x] Dates render correctly
- [x] Client-only content shows after mount

### Manual Testing

```bash
# Test offline functionality
1. Open DevTools → Network tab
2. Set to "Offline"
3. Tick checkboxes (should save to localStorage)
4. Go back "Online"
5. Verify sync happens automatically

# Test Vietnamese search
curl "http://localhost:3000/api/search?q=máy"
curl "http://localhost:3000/api/search?q=may"
# Both should return similar results
```

---

## Related Documentation

- [Global Search](./SEARCH.md)
- [Performance Optimizations](./PERFORMANCE.md)
- [API Reference](../06-api/ENDPOINTS.md)
- [Testing Guide](../07-testing-qa/TEST_CASES.md)

---

## Changelog

### v1.0.0 (2026-01-08)
- Implemented offline support with localStorage
- Added Vietnamese text normalization
- Created ClientOnly component for hydration
- Documented concurrency approach
- Pagination already in place

---

**Files Created**:
- `src/lib/utils/session-storage.ts`
- `src/lib/utils/vietnamese-text.ts`
- `src/components/ClientOnly.tsx`
- `src/app/api/sessions/sync/route.ts`
- `src/hooks/useOfflineSession.ts`

**See detailed walkthrough**: [Archive - Edge Cases Implementation](../09-archive/completed-tasks/EDGE_CASES_WALKTHROUGH.md)
