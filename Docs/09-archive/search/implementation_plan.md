# Global Search Implementation Plan

This plan implements a comprehensive global search feature with advanced filtering, debouncing, and caching using SWR.

## Proposed Changes

### Backend API

#### [NEW] [route.ts](file:///d:/PROCESS%20MANAGEMENT/vitechco-process-hub/src/app/api/search/route.ts)

Create the main search API endpoint that:
- Accepts query parameters: `q` (search term), `tag` (filter by tag), `brandId` (filter by brand), `skip`, `take` (pagination)
- Searches both `title` and `content` fields using Prisma's `contains` operator
- Filters by tag and brandId when provided
- Implements pagination with default `take` of 20
- Returns documents with all related data (documentType, machineModels, tags, departments)
- Returns total count for pagination UI
- Uses the existing Prisma client from `@/lib/prisma/client`

The endpoint will follow the pattern established by the existing `/api/documents/route.ts` but with enhanced filtering and pagination capabilities.

---

### Frontend Components

#### [NEW] [SearchInput.tsx](file:///d:/PROCESS%20MANAGEMENT/vitechco-process-hub/src/components/SearchInput.tsx)

A new search input component that:
- Uses `use-debounce` with 300ms delay to avoid excessive API calls
- Integrates `swr` for automatic data fetching, caching, and revalidation
- Manages search state (query, selected tag, selected brand)
- Provides a clean, accessible input interface
- Shows loading indicator during debounce/fetch
- Emits search events that trigger the results grid update

Key features:
- Real-time search with debouncing
- SWR automatic cache invalidation
- Loading states
- Error handling

#### [NEW] [SearchResultsGrid.tsx](file:///d:/PROCESS%20MANAGEMENT/vitechco-process-hub/src/components/SearchResultsGrid.tsx)

A results display component that:
- Receives search parameters from `SearchInput`
- Uses SWR to fetch and cache results from `/api/search`
- Displays results in a responsive grid layout
- Shows `Skeleton` components during loading (using existing `src/components/ui/skeleton.tsx`)
- Handles empty states with helpful messaging
- Shows document cards with:
  - Title
  - Document type badge
  - Machine models/brands
  - Tags
  - Excerpt from content
  - Link to full document
- Implements pagination controls

---

### Shared Hooks (Optional Enhancement)

#### [NEW] [useSearch.ts](file:///d:/PROCESS%20MANAGEMENT/vitechco-process-hub/src/hooks/useSearch.ts)

A custom hook to encapsulate search logic:
- Manages debounced search state
- Wraps SWR for search API calls
- Returns loading, error, data states
- Provides methods to update search params
- Makes the search functionality reusable across components

## Verification Plan

### Automated Tests

Currently, the project uses Jest for testing (as seen in `package.json`). We can verify the implementation by:

1. **API Endpoint Testing**: Run the development server and test the API manually
   ```bash
   npm run dev
   ```
   Then test with curl:
   ```bash
   # Basic search
   curl "http://localhost:3000/api/search?q=test"
   
   # Search with filters
   curl "http://localhost:3000/api/search?q=test&tag=SC%20Code&skip=0&take=10"
   
   # Search by brand
   curl "http://localhost:3000/api/search?brandId=<brand-id>&skip=0&take=10"
   ```

2. **Database Testing**: Verify Prisma queries return expected results
   - Use existing database with sample data
   - Test various search combinations
   - Verify pagination works correctly

### Manual Verification

1. **UI Testing via Browser**:
   - Navigate to the page containing the SearchInput component
   - Type a search query and verify debounce (should wait 300ms before fetching)
   - Verify skeleton loading states appear during fetch
   - Check that results populate correctly
   - Test filtering by tag and brand
   - Verify pagination controls work
   - Test empty states (no results found)

2. **Performance Testing**:
   - Verify SWR caching: search same query twice, second should be instant
   - Check network tab to confirm debouncing prevents excessive requests
   - Verify loading states transition smoothly

3. **Edge Cases**:
   - Empty search query
   - Very long search queries
   - Special characters in search
   - No results found
   - Network errors

> [!IMPORTANT]
> Since this is a new feature, we'll need to integrate the components into an existing page. Please advise where you'd like the search functionality to be displayed (homepage, dedicated search page, navigation bar, etc.).
