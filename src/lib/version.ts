/**
 * Version management for frontend-backend synchronization
 * Prevents deployment conflicts by tracking app version and build ID
 * 
 * Following Vercel recommendation: "Prevent Frontend-Backend Mismatches"
 */

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || 'local';
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

/**
 * Get comprehensive version information
 * Used by health check endpoint and client-side version detection
 */
export function getVersionInfo() {
    return {
        version: APP_VERSION,
        buildId: BUILD_ID,
        buildTime: BUILD_TIME,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
    };
}

/**
 * Compare two version strings
 * Returns true if versions match
 */
export function compareVersions(v1: string, v2: string): boolean {
    return v1 === v2;
}
