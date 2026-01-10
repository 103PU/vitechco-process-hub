// ================================================================
// ENHANCED SEARCH API - USAGE EXAMPLES
// ================================================================
// All 3 missing filters have been added:
// 1. modelId - Filter by machine model
// 2. departmentId - Filter by department  
// 3. tags[] - Multiple tags support
// ================================================================

import { useSearch } from '@/hooks/useSearch';

// Example 1: Search with multiple tags
const { data, updateParams } = useSearch({
    take: 20,
    tags: ['SC Code', 'Belt', 'Transfer Unit'], // Multiple tags!
});

// Example 2: Filter by specific machine model
updateParams({
    q: 'maintenance',
    modelId: 'clxxxx-model-id', // Specific model like "MPC 3004"
});

// Example 3: Filter by department
updateParams({
    departmentId: 'clxxxx-dept-id', // e.g., "Kỹ thuật"
});

// Example 4: Combine all filters
updateParams({
    q: 'ricoh',
    tags: ['SC Code', 'Maintenance'],
    modelId: 'model-id-here',
    departmentId: 'dept-id-here',
    skip: 0,
    take: 20,
});

// ================================================================
// DIRECT API CALLS (curl examples)
// ================================================================

// Search with multiple tags
// GET /api/search?tags=SC%20Code&tags=Belt&tags=Transfer

// Filter by machine model
// GET /api/search?q=maintenance&modelId=clxxxx-model-id

// Filter by department
// GET /api/search?departmentId=clxxxx-dept-id

// Combined filters
// GET /api/search?q=ricoh&tags=SC%20Code&tags=Belt&modelId=xxx&departmentId=yyy

// ================================================================
// BACKWARD COMPATIBILITY
// ================================================================
// Old single tag syntax still works:
// GET /api/search?tag=SC%20Code
