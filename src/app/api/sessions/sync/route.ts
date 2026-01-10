import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

/**
 * POST /api/sessions/sync
 * 
 * Sync work session checklist progress from client
 * Used by SessionStateManager for offline sync
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { workSessionId, documentId, progress } = body;

        if (!workSessionId || !documentId || !progress) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Find the work session item
        const workSessionItem = await prisma.workSessionItem.findFirst({
            where: {
                workSessionId,
                documentId,
            },
        });

        if (!workSessionItem) {
            return NextResponse.json(
                { error: 'Work session item not found' },
                { status: 404 }
            );
        }

        // Update progress
        await prisma.workSessionItem.update({
            where: {
                id: workSessionItem.id,
            },
            data: {
                progressJson: JSON.stringify(progress),
                status: 'IN_PROGRESS',
            },
        });

        console.log('[Session Sync] Progress synced:', workSessionId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Session Sync] Failed to sync progress:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
