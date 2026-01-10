import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { ensureBucketExists } from '../src/lib/storage/s3';
import { ClassificationService } from '../src/lib/classification';
import { ImportService } from '../src/lib/import/import-service';

const prisma = new PrismaClient();
const classifier = new ClassificationService(prisma);
const importService = new ImportService(prisma, classifier);

console.log("DEBUG: Services initialized.");

// --- CLI HANDLER ---
const args = process.argv.slice(2);
const command = args[0];
const targetArg = args.find(a => a.startsWith('--target='))?.split('=')[1];
const modeArg = args.find(a => a.startsWith('--mode='))?.split('=')[1] as 'fast' | 'full' || 'fast';

async function main() {
    console.log("DEBUG: Entering main()");
    console.log(`🛠️  VITECHCO DATA MANAGER TOOL (v4 - Enterprise Ingestion)`);
    console.log(`=======================================================`);

    try {
        console.log("DEBUG: Checking S3 storage...");
        await ensureBucketExists();
        console.log("DEBUG: S3 storage OK.");
    } catch (e: any) {
        // Reduced noise logging for S3
        if (e.message !== "S3 Connection Timeout") console.error("   ❌ S3 Init Failed:", e);
    }

    if (!command) {
        // ... (usage)
        process.exit(0);
    }

    try {
        if (command === 'clean') {
            await cleanAllData();
        }
        else if (command === 'import') {
            if (!targetArg) throw new Error("Missing --target for import command.");
            console.log(`DEBUG: Calling importData("${targetArg}") [Mode: ${modeArg}]`);
            await importData(targetArg, modeArg);
        }
        else {
            console.error(`Unknown command: ${command}`);
        }
    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

async function cleanAllData() {
    console.log(`🧹 Cleaning ALL database data...`);
    await prisma.documentVersion.deleteMany({});
    await prisma.documentOnMachineModel.deleteMany({});
    await prisma.documentOnTag.deleteMany({});
    await prisma.documentOnDepartment.deleteMany({});
    await prisma.step.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.documentTopic.deleteMany({});
    await prisma.fileAsset.deleteMany({});
    console.log(`   ✅ Database cleaned.`);
}

// GLOBAL STATS
const RUN_STATS = {
    startTime: Date.now(),
    processed: 0,
    success: 0,
    skipped: 0,
    errors: 0,
    aiClassified: 0,
    regexClassified: 0,
    hybridClassified: 0,
    heuristicClassified: 0
};

async function importData(rootPath: string, mode: 'fast' | 'full' = 'fast') {
    RUN_STATS.startTime = Date.now();
    rootPath = rootPath.replace(/^"|"$/g, '');
    console.log(`📥 Importing data from: "${rootPath}" [Mode: ${mode}]`);

    if (!fs.existsSync(rootPath)) {
        throw new Error(`Path not found: ${rootPath}`);
    }

    const deptFolder = path.basename(rootPath);
    console.log(`   🏢 Department Scope: ${deptFolder}`);

    await processFolderRecursive(rootPath, [deptFolder], mode);

    const duration = (Date.now() - RUN_STATS.startTime) / 1000;

    console.log("\n=======================================================");
    console.log("📊 IMPORT PERFORMANCE REPORT");
    console.log("=======================================================");
    console.log(`⏱️  Duration:      ${duration.toFixed(2)}s`);
    console.log(`📄 Total Files:    ${RUN_STATS.processed}`);
    console.log(`✅ Success:        ${RUN_STATS.success}`);
    console.log(`⏭️  Skipped:        ${RUN_STATS.skipped}`);
    console.log(`❌ Failed:         ${RUN_STATS.errors}`);
    console.log("-------------------------------------------------------");
    console.log("🤖 INTELLIGENCE METRICS");
    console.log(`🧠 AI Powered:     ${RUN_STATS.aiClassified} (${((RUN_STATS.aiClassified / (RUN_STATS.success || 1)) * 100).toFixed(1)}%)`);
    console.log(`⚡ Hybrid (AI+Rgx):${RUN_STATS.hybridClassified}`);
    console.log(`📝 Regex Only:     ${RUN_STATS.regexClassified}`);
    console.log(`📁 Folder Only:    ${RUN_STATS.heuristicClassified}`);
    console.log("=======================================================\n");
}

async function processFolderRecursive(currentPath: string, pathStack: string[], mode: 'fast' | 'full') {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(currentPath, item.name);

        if (item.isDirectory()) {
            const dirName = item.name.trim();
            await processFolderRecursive(fullPath, [...pathStack, dirName], mode);
        } else if (item.isFile()) {
            if (shouldSkipFile(item.name)) continue;

            RUN_STATS.processed++;
            console.log(`   Processing: ${item.name}...`);
            const result = await importService.processFile(fullPath, pathStack, undefined, mode);

            if (result.status === 'success') {
                console.log(`     ✅ Imported: [ID: ${result.documentId}]`);
                RUN_STATS.success++;

                // Track Classification Source
                const source = result.classification?.source;
                if (source === 'AI') RUN_STATS.aiClassified++;
                else if (source === 'Hybrid') RUN_STATS.hybridClassified++;
                else if (source === 'Regex') RUN_STATS.regexClassified++;
                else RUN_STATS.heuristicClassified++;

            } else if (result.status === 'skipped') {
                console.log(`     ⏭️  Skipped: ${result.message}`);
                RUN_STATS.skipped++;
            } else {
                console.error(`     ❌ Error: ${result.message}`);
                RUN_STATS.errors++;
            }
        }
    }
}

function shouldSkipFile(name: string): boolean {
    return name.startsWith('.') || name.startsWith('~') || name === 'Thumbs.db';
}

main();
