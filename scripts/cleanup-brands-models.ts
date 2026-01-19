import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ALLOWED_BRANDS = ['Ricoh', 'Toshiba', 'Canon', 'Sharp', 'Kyocera', 'Konica Minolta', 'HP', 'Epson', 'Brother', 'Fujitsu', 'Xerox', 'Samsung', 'Panasonic'];

async function main() {
    console.log("🚀 Starting Aggressive Brand/Model Cleanup...");

    // 1. DELETE INVALID BRANDS
    // (Cascading delete might be dangerous, better to unlink Documents first or let cascade handle relations if strictly defined)
    // In schema, MachineModel depends on Brand. Documents depend on MachineModel (Cascade).
    // If we delete a Brand, we delete its Models, and thus relations to Documents.
    // We DON'T want to delete Documents. We just want to remove the invalid classification.

    // Step 1: Find Invalid Brands
    const allBrands = await prisma.brand.findMany();
    const invalidBrands = allBrands.filter(b => !ALLOWED_BRANDS.some(allowed => allowed.toLowerCase() === b.name.toLowerCase()));

    for (const brand of invalidBrands) {
        console.log(`❌ Deleting Invalid Brand: "${brand.name}" and its models...`);
        // We must manually delete MachineModels to handle DocumentOnMachineModel correctly if there's no cascade on Document itself (Schema says: DocumentOnMachineModel onDelete Cascade for Model)
        // Schema: DocumentOnMachineModel: machineModel MachineModel @relation(..., onDelete: Cascade)
        // So deleting MachineModel removes the relation, but KEEPS the Document. This is safe.

        await prisma.brand.delete({ where: { id: brand.id } });
    }

    // 2. CLEANUP "SPECIFIC" MODELS in Valid Brands (e.g. "MPC 3504" -> Model "MPC", Tag "MPC 3504")
    const validBrands = await prisma.brand.findMany();

    for (const brand of validBrands) {
        const models = await prisma.machineModel.findMany({
            where: { brandId: brand.id },
            include: { technicalMetadataList: true }
        });

        for (const model of models) {
            // Check if model name has numbers or is "too specific"
            // Simple heuristic used before: "MPC 3504" has space.
            if (model.name.includes(' ') || model.name.match(/\d/)) {
                console.log(`⚠️  Refactoring Specific Model: "[${brand.name}] ${model.name}"`);

                // Extract Series (First word)
                const seriesName = model.name.split(' ')[0]; // e.g., "MPC"
                // If series name is effectively the whole name without numbers (e.g. if name was just "MPC"), we keep it.
                // But here we know it has space or digits.

                // Clean up series name if it contains digits? e.g. "MP2000" -> "MP"?
                // Regex to take only letters?
                // Let's stick to first word for now, usually safe for "MPC 3504" -> "MPC"
                // Exception: "e-Studio 355" -> "e-Studio"

                // Create/Find Series Model
                let seriesModel = await prisma.machineModel.findFirst({
                    where: { name: seriesName, brandId: brand.id }
                });

                if (!seriesModel) {
                    // Check if it exists globally (Schema unique constraint on Name only?)
                    // Schema: model MachineModel { name String @unique ... brand ... }
                    // Name is unique GLOBALLY. So "MPC" can only belong to one Brand.
                    // If Ricoh has MPC, and another brand wants MPC, schema fails.
                    // Assuming MPC is unique to Ricoh.

                    // Try find unique by name
                    const existingGlobal = await prisma.machineModel.findUnique({ where: { name: seriesName } });
                    if (existingGlobal) {
                        if (existingGlobal.brandId === brand.id) {
                            seriesModel = existingGlobal;
                        } else {
                            // Name conflict. "A" -> Toshiba "A", vs BrandX "A".
                            // We might need to append brand? "Toshiba A".
                            // For now, assume seriesName is unique enough or we skip.
                            console.log(`   -> Skipping Series creation for "${seriesName}" (Exists for another brand)`);
                            continue;
                        }
                    } else {
                        seriesModel = await prisma.machineModel.create({
                            data: { name: seriesName, brandId: brand.id }
                        });
                    }
                }

                // Create Tag for Specific Name
                const tagName = model.name;
                let tag = await prisma.tag.findUnique({ where: { name: tagName } });
                if (!tag) {
                    tag = await prisma.tag.create({ data: { name: tagName } });
                }

                // Move Documents
                if (seriesModel && tag) {
                    const metaIds = model.technicalMetadataList.map(d => d.technicalMetadataId);
                    if (metaIds.length > 0) {
                        try {
                            await prisma.$transaction([
                                // Add Tag
                                prisma.documentOnTag.createMany({
                                    data: metaIds.map(id => ({ technicalMetadataId: id, tagId: tag!.id })),
                                    skipDuplicates: true
                                }),
                                // Add Series Model
                                prisma.documentOnMachineModel.createMany({
                                    data: metaIds.map(id => ({ technicalMetadataId: id, machineModelId: seriesModel!.id })),
                                    skipDuplicates: true
                                })
                            ]);
                        } catch (e) { console.error("Error moving docs", e); }
                    }
                }

                // Delete Old Specific Model
                console.log("   -> Deleting specific model record.");
                await prisma.machineModel.delete({ where: { id: model.id } });
            }
        }
    }

    console.log("✅ Cleanup Complete.");
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
