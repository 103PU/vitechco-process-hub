
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding System User...');

    await prisma.user.upsert({
        where: { email: 'system@vitechco.com' },
        update: {},
        create: {
            id: 'system',
            name: 'System Admin',
            email: 'system@vitechco.com',
            role: 'ADMIN',
            password: 'hashed-password-placeholder' // In a real app, hash this
        }
    });

    console.log('✅ System User created (id: system).');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
