import { ClassificationService } from '../src/lib/classification';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client (We only need types, won't connect to DB for this logic test)
const prisma = new PrismaClient();

async function runTests() {
    console.log("🧪 STARTING LOGIC TEST SUITE (V2)...");
    console.log("==================================================");

    const classifier = new ClassificationService(prisma);

    // TEST DATA
    const testCases = [
        {
            name: "Junk Brand Removal",
            inputName: "TEST MÁY RICOH A4 OFFICE.pdf",
            path: ["TEST", "Tài Liệu", "Kỹ Thuật", "TEST MÁY RICOH"],
            expectedBrand: "Ricoh",
            expectedModels: 0
        },
        {
            name: "Valid Brand (HP)",
            inputName: "HP LaserJet Pro M404dn.pdf",
            path: ["HP", "Drivers", "Install"],
            expectedBrand: "HP",
            expectedModels: 1
        },
        {
            name: "Complex Range Expansion",
            inputName: "Service Manual MPC 3003-3503-4503.pdf",
            path: ["Ricoh", "Manuals", "Service"],
            expectedBrand: "Ricoh",
            expectedModels: 3 // Should become MPC 3003, MPC 3503, MPC 4503
        },
        {
            name: "Slash Delimiter Expansion",
            inputName: "Canon iR 2520/2525.pdf",
            path: ["Canon", "Docs", "User"],
            expectedBrand: "Canon",
            expectedModels: 2
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of testCases) {
        console.log(`
🔹 Running Case: ${test.name}`);
        console.log(`   File: ${test.inputName}`);

        // We use a trick to test private methods or just run the public classifyFromSegments
        // Since classifyFromSegments writes to DB, we will mock the DB calls or catch the error 
        // actually, to test ONLY logic without DB, let's reflect on the private methods if possible
        // OR better: Just instantiate the class and access the private methods via 'any' cast for testing

        const serviceAny = classifier as any;

        // 1. Test Brand Extraction Logic
        let extractedBrand = serviceAny.cleanAndExtractBrand(test.inputName);
        // If not in filename, check folder
        if (!extractedBrand && test.path.length > 3) {
            extractedBrand = serviceAny.cleanAndExtractBrand(test.path[3]);
        }

        const brandPass = extractedBrand === test.expectedBrand;
        console.log(`   Brand Result: "${extractedBrand}" | Expected: "${test.expectedBrand}" -> ${brandPass ? '✅ PASS' : '❌ FAIL'}`);

        // 2. Test Model Expansion Logic
        // Simulate extracting from filename
        const meta = serviceAny.extractMetadataFromName(test.inputName);
        const modelCount = meta.models.length;
        const modelPass = modelCount === test.expectedModels;

        console.log(`   Models Found: [${meta.models.join(', ')}]`);
        console.log(`   Model Count:  ${modelCount} | Expected: ${test.expectedModels} -> ${modelPass ? '✅ PASS' : '❌ FAIL'}`);

        if (brandPass && modelPass) passed++;
        else failed++;
    }

    console.log("\n==================================================");
    console.log(`🏁 SUMMARY: ${passed}/${testCases.length} Passed.`);
    if (failed > 0) console.log("⚠️  Please review the logic for failed cases.");
}

runTests().catch(e => console.error(e));
