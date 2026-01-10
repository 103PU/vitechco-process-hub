import { PrismaClient } from '@prisma/client'
import slugify from 'slugify';

const prisma = new PrismaClient()

// --- DATA DEFINITION ---
const SEED_DATA = {
    departments: [
        "Kỹ thuật", "IT", "Hành chính", "Kế toán", "Kinh doanh"
    ],
    categories: [
        "Quy trình",
        "Tài liệu",
        "Hình ảnh",
        "History"
    ],
    // Mapping Topics to Categories logic:
    // User requested "Loại" (Topics) like "Cài đặt in- scan", "Xử lí lỗi Pan"
    // We will assign these to "Quy trình" or "Tài liệu" as a default parent for now, 
    // or create them broadly. Since topics need a category_id, we will attach them to "Quy trình" primarily.
    topics: {
        "Quy trình": ["Cài đặt in- scan", "Xử lý lỗi Pan", "Vệ sinh", "Thay thế linh kiện"],
        "Tài liệu": ["Hướng dẫn sử dụng", "Catalogue", "Thông số kỹ thuật"],
    }
}

async function main() {
    console.log('🌱 Starting strict hierarchy seeding...')

    // 1. Seed Departments
    console.log('Processing Departments...')
    for (const name of SEED_DATA.departments) {
        await prisma.department.upsert({
            where: { name },
            update: {},
            create: { name }
        })
    }

    // 2. Seed Categories (DocumentType)
    console.log('Processing Categories (Phân Mục)...')
    const catMap = new Map<string, string>(); // name -> id

    for (const name of SEED_DATA.categories) {
        const cat = await prisma.documentType.upsert({
            where: { name },
            update: {},
            create: { name }
        })
        catMap.set(name, cat.id);
    }

    // 3. Seed Topics (DocumentTopic)
    console.log('Processing Topics (Loại)...')

    // Iterate through our defined mapping
    for (const [catName, topicNames] of Object.entries(SEED_DATA.topics)) {
        const catId = catMap.get(catName);
        if (!catId) continue;

        for (const topicName of topicNames) {
            // Create slug safely
            const slug = slugify(`${catName}-${topicName}`, { lower: true, strict: true });

            await prisma.documentTopic.upsert({
                where: {
                    categoryId_name: {
                        categoryId: catId,
                        name: topicName
                    }
                }, // Composite unique constraint
                update: {},
                create: {
                    name: topicName,
                    slug: slug,
                    categoryId: catId
                }
            })
        }
    }

    console.log('✅ Seeding completed successfully.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
