import { prisma } from '@/lib/prisma/client';
import { WorkSession, WorkSessionItem } from '@prisma/client';

export class SessionService {

    /**
     * Create a new work session for a user with selected documents.
     */
    static async createSession(userId: string, documentIds: string[], title?: string) {
        // Create session with items
        return prisma.workSession.create({
            data: {
                userId,
                title: title ?? `Phiên làm việc ${new Date().toLocaleString('vi-VN')}`,
                status: 'OPEN',
                items: {
                    create: documentIds.map(docId => ({
                        documentId: docId,
                        status: 'PENDING'
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        document: {
                            select: { id: true, title: true }
                        }
                    }
                }
            }
        });
    }

    /**
     * Update progress for a specific item (document) in a session.
     * @param sessionId 
     * @param documentId 
     * @param data { progress: any, status?: string }
     */
    static async updateItemProgress(sessionId: string, documentId: string, data: { progress?: any, status?: 'PENDING' | 'IN_PROGRESS' | 'DONE' }) {
        // Find the specific item first
        const item = await prisma.workSessionItem.findFirst({
            where: { workSessionId: sessionId, documentId: documentId }
        });

        if (!item) {
            throw new Error(`Item not found for session ${sessionId} and document ${documentId}`);
        }

        const updateData: any = {};
        if (data.progress) {
            updateData.progressJson = JSON.stringify(data.progress);
        }
        if (data.status) {
            updateData.status = data.status;
            
            // Auto timestamp
            if (data.status === 'IN_PROGRESS' && !item.startedAt) {
                updateData.startedAt = new Date();
            }
            if (data.status === 'DONE') {
                updateData.completedAt = new Date();
            }
        } else if (data.progress && item.status === 'PENDING') {
             // specific logic: if updating progress, switch to IN_PROGRESS
             updateData.status = 'IN_PROGRESS';
             if (!item.startedAt) updateData.startedAt = new Date();
        }

        return prisma.workSessionItem.update({
            where: { id: item.id },
            data: updateData
        });
    }

    /**
     * Complete the session.
     */
    static async completeSession(sessionId: string) {
        return prisma.workSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                endTime: new Date()
            }
        });
    }
    
    /**
     * Get active session for user
     */
    static async getActiveSession(userId: string) {
        return prisma.workSession.findFirst({
            where: { userId, status: 'OPEN' },
            include: {
                items: {
                    include: {
                        document: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
