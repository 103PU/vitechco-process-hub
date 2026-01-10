
import { PrismaClient } from '@prisma/client';
import { ClassificationService } from '../src/lib/classification';

const prisma = new PrismaClient();
const service = new ClassificationService(prisma);

async function main() {
    console.log("Debugging Classification...");

    const fileName = "KẾ HOẠCH TRAINING 03mths MP7001-2 MPC 6502-24082024 PDF.pdf";
    // Simulate path segments
    const pathSegments = [
        "TECHNICAL - IT DEPARTMENT",
        "QUY TRÌNH KỸ THUẬT VITECHCO",
        "TRAINING",
        fileName
    ];

    try {
        console.log(`Analyzing: ${fileName}`);
        const result = await service.classifyFromSegments(pathSegments, fileName, false);

        console.log("--- RESULT ---");
        console.log("Brand:", result.brand?.name);
        console.log("Models (Series):", result.models.map(m => m.name));
        console.log("Tags:", result.tags);
        console.log("Source:", result.source);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
