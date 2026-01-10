
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MAPPINGS = [
    {
        brand: 'Ricoh',
        series: [
            { name: 'MP', patterns: [/^MP\s?\d+/, /^MP\d+/] },
            { name: 'MPC', patterns: [/^MPC\s?\d+/, /^MPC\d+/] },
            { name: 'SP', patterns: [/^SP\s?\d+/] },
            { name: 'Aficio', patterns: [/^Aficio/i] },
            { name: 'Pro', patterns: [/^Pro\s?\d+/i] },
            { name: 'IM', patterns: [/^IM\s?\d+/i] },
        ]
    },
    {
        brand: 'Toshiba',
        series: [
            { name: 'e-Studio', patterns: [/^e-?Studio/i, /^e-\d+/i, /^e\d+/, /^TOSHIBA\s?e/i] },
        ]
    },
    {
        brand: 'Canon',
        series: [
            { name: 'iR-ADV', patterns: [/^iR-?ADV/i] },
            { name: 'iR', patterns: [/^iR\d+/] },
        ]
    },
    {
        brand: 'Konica Minolta',
        series: [
            { name: 'bizhub', patterns: [/^bizhub/i] },
        ]
    }
];

async function main() {
    console.log("🚀 Starting Seed & Reclassify...");

    // 1. Ensure Brands and Models exist
    const brandMap = new Map<string, string>(); // Name -> ID
    const modelMap = new Map<string, string>(); // "Brand:Series" -> ID

    for (const m of MAPPINGS) {
        let brand = await prisma.brand.findUnique({ where: { name: m.brand } });
        if (!brand) {
            brand = await prisma.brand.create({ data: { name: m.brand } });
            console.log(`+ Created Brand: ${m.brand}`);
        }
        brandMap.set(m.brand, brand.id);

        for (const s of m.series) {
            const key = `${m.brand}:${s.name}`;
            let model = await prisma.machineModel.findFirst({
                where: { name: s.name, brandId: brand.id }
            });
            if (!model) {
                // Check if name is taken globally (Schema restriction?)
                // If distinct brands can have same model name, we rely on brandId.
                // If Schema has "name" @unique, then we can't repeat "Pro" for Ricoh and HP.
                // Assuming Schema allows non-unique names OR we use unique prefixes.
                // Checking Schema: `model MachineModel { name String @unique ... }`
                // OUCH. Name is unique globally.
                // So we cannot have Ricoh "Pro" and HP "Pro".
                // We should name them "Ricoh Pro", "HP Pro"? Or just "Pro" and assign to one?
                // For now, try create. If fails, find who owns it.

                try {
                    model = await prisma.machineModel.create({
                        data: { name: s.name, brandId: brand.id }
                    });
                    console.log(`+ Created Model: ${s.name} for ${m.brand}`);
                } catch (e) {
                    // Find who owns it
                    model = await prisma.machineModel.findUnique({ where: { name: s.name } });
                    if (model && model.brandId !== brand.id) {
                        console.warn(`! Model conflict: "${s.name}" owned by another brand. Skipping creation for ${m.brand}.`);
                        // We might need to resolve this later if we encounter such data.
                    }
                }
            }
            if (model) {
                brandMap.set(s.name, brand.id); // Map Series Name to Brand ID (simplification)
                modelMap.set(s.name, model.id); // Map Series Name to Model ID
            }
        }
    }

    // 2. Scan Documents and Links based on Tags
    const documents = await prisma.document.findMany({
        include: { tags: { include: { tag: true } }, machineModels: true }
    });

    console.log(`Processing ${documents.length} documents...`);

    for (const doc of documents) {
        // If already has a Model, skip? Or re-verify?
        // Let's re-verify/fill missing.

        if (doc.machineModels.length > 0) continue;

        let assigned = false;

        // Pattern Match on Tags
        for (const dt of doc.tags) {
            const tagName = dt.tag.name;

            for (const map of MAPPINGS) {
                for (const series of map.series) {
                    for (const pattern of series.patterns) {
                        if (pattern.test(tagName)) {
                            // Match!
                            // Link Pattern: Tag "MPC 3504" -> Series "MPC"
                            const modelId = modelMap.get(series.name);
                            if (modelId) {
                                console.log(`   -> Doc "${doc.title}": Tag "${tagName}" matched Series "${series.name}"`);
                                await prisma.documentOnMachineModel.create({
                                    data: { documentId: doc.id, machineModelId: modelId }
                                }).catch(() => { }); // Ignore duplicates
                                assigned = true;
                            }
                        }
                    }
                    if (assigned) break;
                }
                if (assigned) break;
            }
            if (assigned) break;
        }

        if (!assigned) {
            // Fallback: Check if title contains pattern?
            // (Optional, user didn't ask, but good for completeness)
        }
    }

    console.log("✅ Reclassification Complete.");
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
