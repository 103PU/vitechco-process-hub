import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

/**
 * Health Check Endpoint
 * 
 * Returns application health status including:
 * - API availability
 * - Database connectivity
 * - System timestamp
 * 
 * @returns JSON health status
 */
export async function GET() {
    try {
        // Check database connectivity
        await prisma.$queryRaw`SELECT 1`;

        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
            environment: process.env.NODE_ENV || 'development',
            version: process.env.APP_VERSION || '0.1.0',
        };

        return NextResponse.json(healthStatus, { status: 200 });
    } catch (error) {
        const errorStatus = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            environment: process.env.NODE_ENV || 'development',
        };

        return NextResponse.json(errorStatus, { status: 503 });
    }
}
