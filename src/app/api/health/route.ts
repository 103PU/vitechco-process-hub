import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { getVersionInfo } from '@/lib/version';

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
        // Get version info for response
        const versionInfo = getVersionInfo();

        // Check database connectivity
        await prisma.$queryRaw`SELECT 1`;

        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected',
            ...versionInfo, // Include version and environment info from getVersionInfo
        };

        return NextResponse.json(healthStatus, { status: 200 });
    } catch (error) {
        const versionInfo = getVersionInfo(); // Get version info even on error for consistency

        const errorStatus = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            ...versionInfo, // Include version and environment info from getVersionInfo
        };

        return NextResponse.json(errorStatus, { status: 503 });
    }
}
