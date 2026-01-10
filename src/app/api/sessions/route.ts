// src/app/api/sessions/route.ts
// API endpoint for Work Session workflow (Next.js 13 App Router)

import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/services/session-service';

// SessionService has static methods, no instance needed

export async function POST(request: NextRequest) {
    // Create a new WorkSession
    // Expected body: { userId: string, docIds: string[] }
    try {
        const { userId, docIds } = await request.json();
        if (!userId || !Array.isArray(docIds)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
        const session = await SessionService.createSession(userId, docIds);
        return NextResponse.json(session);
    } catch (e: any) {
        console.error('Create session error:', e);
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    // Update progress for a specific WorkSessionItem
    // Expected body: { sessionId: string, docId: string, progressJson: string }
    try {
        const { sessionId, docId, progressJson } = await request.json();
        if (!sessionId || !docId) {
            return NextResponse.json({ error: 'Missing sessionId or docId' }, { status: 400 });
        }
        const item = await SessionService.updateItemProgress(sessionId, docId, progressJson);
        return NextResponse.json(item);
    } catch (e: any) {
        console.error('Update item progress error:', e);
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    // Mark a session as completed
    // Expected body: { sessionId: string }
    try {
        const { sessionId } = await request.json();
        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }
        const session = await SessionService.completeSession(sessionId);
        return NextResponse.json(session);
    } catch (e: any) {
        console.error('Complete session error:', e);
        return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
}
