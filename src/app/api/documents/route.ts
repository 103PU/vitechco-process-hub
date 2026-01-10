import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';

    const documents = await prisma.document.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
            },
          },
          {
            content: {
              contains: searchTerm,
            },
          },
        ],
      },
      include: {
        documentType: true,
        machineModels: {
          include: {
            machineModel: {
              include: {
                brand: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        departments: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    // Ensure you return a Response object in case of error
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
