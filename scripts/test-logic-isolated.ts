// Mock test script with UPDATED Logic (Mirroring the changes in classification.ts)
// This confirms the logic works before we assume the file is perfect.

const KNOWN_BRANDS = [
    'RICOH', 'TOSHIBA', 'CANON', 'SHARP', 'HP', 
    'KONICA MINOLTA', 'KONICA', 'MINOLTA',
    'KYOCERA', 'BROTHER', 'EPSON', 'XEROX', 'FUJI XEROX',
    'SAMSUNG', 'PANASONIC', 'LEXMARK', 'OKI'
];

function cleanAndExtractBrand(rawInput: string): string | null {
    const upper = rawInput.toUpperCase();
    for (const known of KNOWN_BRANDS) {
        if (upper.includes(known)) {
            if (known === 'KONICA' || known === 'MINOLTA' || known === 'KONICA MINOLTA') return 'Konica Minolta';
            if (known === 'HP') return 'HP';
            if (known === 'OKI') return 'Oki';
            if (known === 'FUJI XEROX') return 'Xerox';
            return known.charAt(0) + known.slice(1).toLowerCase();
        }
    }
    return null;
}

function expandModelNames(rawInput: string): string[] {
    const results: string[] = [];
    const mainRegex = /^([a-zA-Z\s\-\.]+)([\d\w\/\-\,\s]+)$/; 
    
    const match = rawInput.match(mainRegex);
    if (match) {
        const prefix = match[1].trim(); 
        const numberPart = match[2];    
        
        const tokens = numberPart.split(/[\/\-\,\s]+/).map(s => s.trim()).filter(s => s.length >= 2);

        for (const token of tokens) {
            const firstWordOfPrefix = prefix.split(/[\s\-]/)[0]; 
            
            if (firstWordOfPrefix && token.toLowerCase().startsWith(firstWordOfPrefix.toLowerCase())) {
                results.push(token);
            } else {
                results.push(`${prefix} ${token}`);
            }
        }
    } 
    
    if (results.length === 0 && rawInput.trim().length > 2) {
         results.push(rawInput.trim());
    }
    
    return Array.from(new Set(results));
}

function extractMetadataFromName(fileName: string): { brand?: string, models: string[] } {
    const name = fileName.toUpperCase();
    let brand: string | undefined;
    let models: string[] = [];

    brand = cleanAndExtractBrand(name) ?? undefined;

    const PATTERNS = [
        { series: 'MPC', regex: /MPC\s?([\w\d\-\/\,]+)/ },
        { series: 'MP', regex: /MP\s?([\w\d\-\/\,]+)/ },
        { series: 'IM', regex: /IM\s?([\w\d\-\/\,]+)/ },
        { series: 'SP', regex: /SP\s?([\w\d\-\/\,]+)/ },
        { series: 'Aficio', regex: /Aficio\s?([\w\d\-\/\,]+)/i },
        { series: 'e-Studio', regex: /e-?Studio\s?([\w\d\-\/\,]+)/i },
        { series: 'iR-ADV', regex: /iR-?ADV\s?([\w\d\-\/\,]+)/i },
        { series: 'iR', regex: /iR\s?([\w\d\-\/\,]+)/i },
        { series: 'HP', regex: /HP\s?LaserJet\s?(Pro|Enterprise)?\s?([\w\d\-\/\,]+)/i },
        { series: 'Pro', regex: /Pro\s?C([\w\d\-\/\,]+)/i }
    ];

    for (const p of PATTERNS) {
        const match = name.match(p.regex);
        if (match) {
            const fullMatchString = match[0]; 
            models = expandModelNames(fullMatchString);

            if (!brand) {
                if (['MP', 'MPC', 'SP', 'IM', 'Aficio', 'Pro'].includes(p.series)) brand = 'Ricoh';
                if (['e-Studio'].includes(p.series)) brand = 'Toshiba';
                if (['iR', 'iR-ADV'].includes(p.series)) brand = 'Canon';
                if (['HP'].includes(p.series)) brand = 'HP';
            }
            break;
        }
    }

    return { brand, models };
}

// --- RUN TESTS ---
console.log("🧪 STARTING LOGIC TEST SUITE (UPDATED ISOLATED MODE)...");
console.log("==================================================");

const testCases = [
    {
        name: "Junk Brand Removal",
        inputName: "TEST MÁY RICOH A4 OFFICE.pdf",
        path: [],
        expectedBrand: "Ricoh",
        expectedModels: 0
    },
    {
        name: "Valid Brand (HP)",
        inputName: "HP LaserJet Pro M404dn.pdf",
        path: [],
        expectedBrand: "HP",
        expectedModels: 1
    },
    {
        name: "Complex Range Expansion",
        inputName: "Service Manual MPC 3003-3503-4503.pdf",
        path: [],
        expectedBrand: "Ricoh",
        expectedModels: 3
    },
    {
        name: "Slash Delimiter Expansion",
        inputName: "Canon iR 2520/2525.pdf",
        path: [],
        expectedBrand: "Canon",
        expectedModels: 2
    },
    {
        name: "Toshiba e-Studio",
        inputName: "Toshiba e-Studio 2508A-3008A-3508A.pdf",
        path: [],
        expectedBrand: "Toshiba",
        expectedModels: 3
    }
];

let passed = 0;
let failed = 0;

for (const test of testCases) {
    console.log(`\n🔹 Running Case: ${test.name}`);
    console.log(`   File: ${test.inputName}`);
    
    // 1. Test Brand Extraction Logic
    let extractedBrand = cleanAndExtractBrand(test.inputName);

    const brandPass = extractedBrand === test.expectedBrand;
    console.log(`   Brand Result: "${extractedBrand}" | Expected: "${test.expectedBrand}" -> ${brandPass ? '✅ PASS' : '❌ FAIL'}`);

    // 2. Test Model Expansion Logic
    const meta = extractMetadataFromName(test.inputName);
    const modelCount = meta.models.length;
    const modelPass = modelCount === test.expectedModels;
    
    console.log(`   Models Found: [${meta.models.join(', ')}]`);
    console.log(`   Model Count:  ${modelCount} | Expected: ${test.expectedModels} -> ${modelPass ? '✅ PASS' : '❌ FAIL'}`);

    if (brandPass && modelPass) passed++;
    else failed++;
}

console.log("\n==================================================");
console.log(`🏁 SUMMARY: ${passed}/${testCases.length} Passed.`);