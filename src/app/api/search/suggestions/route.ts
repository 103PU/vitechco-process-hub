import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const suggestions = await prisma.document.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      select: {
        id: true,
        title: true,
      },
      take: 5, // Limit to 5 suggestions
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
