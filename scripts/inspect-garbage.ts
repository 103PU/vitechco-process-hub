
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const models = await prisma.machineModel.findMany({
        include: { brand: true, documents: true },
        orderBy: { name: 'asc' }
    });

    console.log("--- Potentially Invalid Models (containing numbers or spaces) ---");
    models.forEach(m => {
        if (m.name.match(/\d/) || m.name.includes(' ')) {
            console.log(`[GARBAGE?] ID: ${m.id} | Name: "${m.name}" | Brand: ${m.brand?.name} | Docs: ${m.documents.length}`);
        } else {
            console.log(`[VALID?]   ID: ${m.id} | Name: "${m.name}" | Brand: ${m.brand?.name}`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
