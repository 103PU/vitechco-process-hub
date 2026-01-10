# Global Search Implementation Task

## Backend
- [x] Create `src/app/api/search/route.ts`
  - [x] Implement Prisma query with `q`, `tag`, `brandId` params
  - [x] Add title/content search logic
  - [x] Implement pagination (skip/take)
  - [x] Return proper response format

## Frontend Components
- [x] Create `SearchInput` component
  - [x] Implement use-debounce hook (300ms delay)
  - [x] Integrate SWR for data fetching
  - [x] Handle input state and user interactions
  
- [x] Create `SearchResultsGrid` component
  - [x] Display search results in grid layout
  - [x] Use Skeleton components for loading states
  - [x] Handle empty states
  - [x] Show document metadata (title, type, tags, etc.)

## Testing & Verification
- [x] Test search API endpoint
- [x] Verify debounce functionality
- [x] Test SWR caching behavior
- [x] Verify UI loading states
