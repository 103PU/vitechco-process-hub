
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- Current Machine Models ---");
    const models = await prisma.machineModel.findMany({
        orderBy: { name: 'asc' }
    });
    models.forEach(m => console.log(`[${m.id}] ${m.name} (BrandId: ${m.brandId})`));

    console.log("\n--- Sample Tags (First 20) ---");
    const tags = await prisma.tag.findMany({
        take: 20,
        orderBy: { name: 'asc' }
    });
    tags.forEach(t => console.log(`[${t.id}] ${t.name}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
