import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOCUMENT_TYPES = [
  'Quy trình',
  'Tài liệu kỹ thuật',
  'Báo cáo',
  'Bản vẽ',
  'Mã nguồn',
  'Cấu hình',
  'Log',
  'Dữ liệu người dùng',
  'Dữ liệu hệ thống'
];

async function main() {
  console.log('Seeding Document Types...');

  for (const typeName of DOCUMENT_TYPES) {
    await prisma.documentType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
    console.log(`- Ensured type: "${typeName}"`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
