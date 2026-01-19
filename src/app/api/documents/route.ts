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
        technicalMetadata: {
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
          }
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedDocuments = documents.map((doc: any) => ({
      ...doc,
      documentType: doc.technicalMetadata?.documentType,
      machineModels: doc.technicalMetadata?.machineModels,
      tags: doc.technicalMetadata?.tags,
      technicalMetadata: undefined
    }));

    return NextResponse.json(mappedDocuments);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    // Ensure you return a Response object in case of error
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
