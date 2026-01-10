# Global Search Feature

**Status**: ✅ Approved & Deployed  
**Last Updated**: 2026-01-08  
**Owner**: Development Team

---

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Implementation](#implementation)
- [Usage](#usage)
- [Performance](#performance)
- [Testing](#testing)

---

## Overview

The Global Search feature provides comprehensive document search with advanced filtering capabilities, debouncing, and intelligent caching.

### Key Features
- ✅ Full-text search across title and content
- ✅ Advanced filtering (tags, brands, models, departments)
- ✅ 300ms debounce for efficient API calls
- ✅ SWR caching for instant results
- ✅ Pagination with "Load More"
- ✅ Vietnamese text normalization
- ✅ Mobile-first responsive design

---

## Architecture

### Backend API

**Endpoint**: `GET /api/search`

**Parameters**:
- `q` - Search query (searches title and content)
- `tag` - Single tag filter (legacy)
- `tags[]` - Multiple tags filter (array)
- `brandId` - Filter by brand
- `modelId` - Filter by machine model  
- `departmentId` - Filter by department
- `skip` - Pagination offset (default: 0)
- `take` - Results per page (default: 20)

**Response**:
```json
{
  "documents": [...],
  "totalCount": 150,
  "skip": 0,
  "take": 20,
  "hasMore": true
}
```

**Key Optimizations**:
1. **Selective Field Loading**: Excludes heavy `content` field
2. **Vietnamese Normalization**: Matches "máy" with "may"
3. **Limited Relations**: Only first 3-5 related items
4. **96% Data Reduction**: From 2.5MB → 100KB for 20 docs

---

### Frontend Components

#### SearchInput Component
Location: `src/components/SearchInput.tsx`

Features:
- Debounced input (300ms)
- Loading indicator
- Clear button
- Controlled component pattern

#### SearchResultsGrid Component  
Location: `src/components/SearchResultsGrid.tsx`

Features:
- Skeleton loaders
- Empty states
- Memoized cards (React.memo)
- Mobile-responsive grid
- "Load More" pagination

#### useSearch Hook
Location: `src/hooks/useSearch.ts`

Features:
- SWR integration
- URL parameter management
- Debounce handling
- Type-safe interfaces

---

## Implementation

### Phase 1: Core Search ✅

Implemented:
- Backend API `/api/search`
- Search parameters: `q`, `tag`, `brandId`
- Basic pagination
- Full document relations

**Code Reference**: [implementation_plan.md](../09-archive/search/implementation_plan.md)

### Phase 2: Filter Enhancements ✅

Added filters:
1. **modelId** - Machine model filtering
2. **departmentId** - Department filtering  
3. **tags[]** - Multiple tag support

**Details**: [filters_added.md](../09-archive/search/filters_added.md)

### Phase 3: Performance Optimization ✅

Optimizations applied:
- Selective field loading (exclude `content`)
- Limit related data (take: 3-5)
- Vietnamese text normalization
- React.memo for cards

**Impact**: 96% data reduction, 83% faster renders

**Details**: See [Performance Documentation](./PERFORMANCE.md)

---

## Usage

### Basic Search

```typescript
import { useSearch } from '@/hooks/useSearch';

function MyPage() {
  const { data, isLoading, updateParams } = useSearch({
    q: 'photocopy',
    take: 20
  });

  return (
    <div>
      <SearchInput 
        value={query}
        onChange={(e) => updateParams({ q: e.target.value })}
        isLoading={isLoading}
      />
      <SearchResultsGrid 
        documents={data?.documents || []}
        isLoading={isLoading}
        totalCount={data?.totalCount || 0}
        hasMore={data?.hasMore || false}
      />
    </div>
  );
}
```

### Advanced Filtering

```typescript
//  Multiple filters
updateParams({
  q: 'manual',
  tags: ['SC Code', 'Maintenance'],
  brandId: 'ricoh-123',
  modelId: 'mpc-3004',
  departmentId: 'technical'
});
```

### API Direct Usage

```bash
# Search with Vietnamese text
curl "http://localhost:3000/api/search?q=máy%20photocopy"

# Multiple filters
curl "http://localhost:3000/api/search?tags=SC%20Code&tags=Error&brandId=ricoh-123"

# Pagination
curl "http://localhost:3000/api/search?q=manual&skip=20&take=20"
```

---

## Performance

### Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API Response Size | 2.5MB | 100KB | 96% ↓ |
| Search Latency | ~500ms | ~100ms | 80% ↓ |
| Render Time | 1500ms | 250ms | 83% ↓ |
| Re-renders/tick | 100 | 1 | 99% ↓ |

### Optimizations Applied

1. **Debouncing** (300ms)
   - Prevents excessive API calls
   - Smooth typing experience

2. **SWR Caching**
   - 2-second deduplication
   - Instant cached results
   - Background revalidation

3. **Selective Loading**
   - Exclude `content` field
   - Limit relations (3-5 items)
   - Only essential metadata

4. **React.memo**
   - Memoized DocumentCard
   - Prevents unnecessary re-renders
   - 99% reduction in renders

---

## Testing

### Test Cases

#### Search Functionality
- [x] Basic text search works
- [x] Vietnamese characters search correctly  
- [x] Multiple filters work together
- [x] Pagination loads more results
- [x] Empty search shows proper message
- [x] Special characters don't break search

#### Performance
- [x] Search results load < 200ms
- [x] Navigation feels instant (< 100ms)
-[x] No layout shifts during loading
- [x] Smooth scrolling on lists

#### Edge Cases
- [x] Empty query handled
- [x] No results message shown
- [x] Network errors caught
- [x] Debounce prevents spam
- [x] Vietnamese normalization works

### Manual Testing

```bash
# Start dev server
npm run dev

# Test endpoints
curl "http://localhost:3000/api/search?q=test"
curl "http://localhost:3000/api/search?q=máy" # Vietnamese
curl "http://localhost:3000/api/search?tags=SC%20Code&tags=Error"
```

---

## Related Documentation

- [Performance Optimizations](./PERFORMANCE.md)
- [Vietnamese Text Normalization](../02-architecture/VIETNAMESE_TEXT.md)
- [API Reference](../06-api/ENDPOINTS.md#search)
- [Testing Guide](../07-testing-qa/TEST_CASES.md)

---

## Changelog

### v1.2.0 (2026-01-08)
- Added multiple tags support (`tags[]`)
- Added `modelId` and `departmentId` filters
- Optimized Prisma queries (96% data reduction)

### v1.1.0 (2026-01-08) 
- Added Vietnamese text normalization
- Improved mobile responsiveness
- Added React.memo optimization

### v1.0.0 (2026-01-08)
- Initial release
- Core search with `q`, `tag`, `brandId`
- SWR caching and debouncing
- Pagination support

---

**For implementation details, see**: [Archive - Search Implementation](../09-archive/search/)
