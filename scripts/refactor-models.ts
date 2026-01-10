
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Model Refactor...");

    const models = await prisma.machineModel.findMany({
        include: { brand: true, documents: true }
    });

    for (const model of models) {
        console.log(`Processing: [${model.brand?.name}] ${model.name}`);

        // 1. Identify "Series" vs "Specific Model"
        // Heuristic: "Name" usually contains "Series Number". 
        // We want "Series" as the new MachineModel name.
        // We want the full "Name" as a Tag.

        let seriesName = model.name.split(' ')[0]; // Default: First word (e.g., MPC, MP, E)

        // Handle cases where name might include Brand (though it shouldn't based on previous logic, but just in case)
        if (model.brand && model.name.toLowerCase().startsWith(model.brand.name.toLowerCase())) {
            seriesName = model.name.substring(model.brand.name.length).trim().split(' ')[0];
        }

        // Special normalization if needed (e.g., "Pro" -> "Pro")
        // User examples: "mp", "mpc", "ac"

        const tagName = model.name; // Use the full original name as the Tag

        console.log(`   -> New Model (Series): "${seriesName}"`);
        console.log(`   -> New Tag: "${tagName}"`);

        await prisma.$transaction(async (tx) => {
            // A. Create/Find the simplified Series Model
            // We need to ensure it's linked to the same Brand
            let seriesModel = await tx.machineModel.findUnique({
                where: { name: seriesName }
            });

            if (!seriesModel) {
                // If the series name coincidentally already exists as a full model name, handle conflict?
                // But unique constraint is on Name.
                // We try creating it.
                // If 'seriesName' == 'model.name' (e.g. Model was just "MPC"), we don't need to do much besides potentially creating a tag

                if (seriesName !== model.name) {
                    // Check if it exists with different brand? Name is unique globally in schema.
                    // If it doesn't exist, create it.
                    try {
                        seriesModel = await tx.machineModel.create({
                            data: {
                                name: seriesName,
                                brandId: model.brandId
                            }
                        });
                    } catch (e) {
                        // If failed due to unique (race condition or check failed), find it
                        seriesModel = await tx.machineModel.findUnique({ where: { name: seriesName } });
                    }
                } else {
                    seriesModel = model;
                }
            }

            if (!seriesModel) throw new Error("Could not instantiate series model");

            // B. Create/Find the Tag
            let tag = await tx.tag.findUnique({ where: { name: tagName } });
            if (!tag) {
                tag = await tx.tag.create({ data: { name: tagName } });
            }

            // C. Move Documents
            // 1. Link Doc to Tag
            // 2. Link Doc to SeriesModel
            // 3. Unlink Doc from OldModel (if OldModel != SeriesModel)

            const docIds = model.documents.map(d => d.documentId);

            if (docIds.length > 0) {
                // 1. Link Tags
                await tx.documentOnTag.createMany({
                    data: docIds.map(id => ({ documentId: id, tagId: tag!.id }))
                });

                // 2. Link New Series Model
                // We need to check if link already exists to avoid unique constraint on join table
                await tx.documentOnMachineModel.createMany({
                    data: docIds.map(id => ({ documentId: id, machineModelId: seriesModel!.id }))
                });

                // 3. Delete Old Model relation (cascade handled on delete, but we just want to remove relation if we aren't deleting the model yet)
                // Actually, we will delete the old MachineModel record if it isn't the SeriesModel
            }
        });

        // D. Delete the old "Specific" Model if it is different from the "Series" Model
        if (seriesName !== model.name) {
            try {
                await prisma.machineModel.delete({ where: { id: model.id } });
                console.log(`   -> Deleted old model record: ${model.name}`);
            } catch (e) {
                console.log(`   -> Skipped deleting ${model.name} (maybe already deleted or in use)`);
            }
        }
    }

    console.log("✅ Refactor complete.");
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
