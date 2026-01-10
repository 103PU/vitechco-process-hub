/**
 * Test Classification Logic
 * Tests for Brand Sanitation and Multi-Model Expansion
 */

import { cleanAndExtractBrand, expandModelNames } from '../src/lib/utils/text-processing';

// Test Cases based on Acceptance Criteria
const testCases = [
    // Brand Sanitation Tests
    { input: 'TEST MÁY RICOH A4', expectedBrand: 'Ricoh', expectedModels: [] },
    { input: 'HP Office', expectedBrand: 'HP', expectedModels: [] },
    { input: 'ABCXYZ', expectedBrand: null, expectedModels: [] }, // null => UNKNOWN
    { input: 'COPY TOSHIBA MÀU', expectedBrand: 'Toshiba', expectedModels: [] },
    { input: 'Canon iR-ADV C5500', expectedBrand: 'Canon', expectedModels: [] },

    // Multi-Model Expansion Tests
    { input: 'MPC 3054-4054-5054', expectedBrand: 'Ricoh', expectedModels: ['MPC 3054', 'MPC 4054', 'MPC 5054'] },
    { input: 'Canon iR 2520/2525', expectedBrand: 'Canon', expectedModels: ['iR 2520', 'iR 2525'] },
    { input: 'e-Studio 557/657', expectedBrand: 'Toshiba', expectedModels: ['e-Studio 557', 'e-Studio 657'] },
    { input: 'MP 6001-7001-8001', expectedBrand: 'Ricoh', expectedModels: ['MP 6001', 'MP 7001', 'MP 8001'] },
];

console.log('🧪 Classification Logic Tests');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

for (const tc of testCases) {
    const brand = cleanAndExtractBrand(tc.input);
    const models = expandModelNames(tc.input);

    const brandMatch = brand === tc.expectedBrand;
    const modelsMatch = JSON.stringify(models) === JSON.stringify(tc.expectedModels);

    if (brandMatch && modelsMatch) {
        console.log(`✅ PASS: "${tc.input}"`);
        passed++;
    } else {
        console.log(`❌ FAIL: "${tc.input}"`);
        console.log(`   Brand:  Expected "${tc.expectedBrand}", Got "${brand}"`);
        console.log(`   Models: Expected ${JSON.stringify(tc.expectedModels)}, Got ${JSON.stringify(models)}`);
        failed++;
    }
}

console.log('='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
