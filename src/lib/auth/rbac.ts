/**
 * Role-Based Access Control (RBAC) System
 * 
 * Defines roles, permissions, and authorization utilities for the application.
 * 
 * @module rbac
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth/config/authOptions';

/**
 * User roles in the system
 */
export enum Role {
    /** Full system access - can manage all resources */
    ADMIN = 'ADMIN',
    /** Can read documents and execute checklists */
    TECHNICIAN = 'TECHNICIAN',
    /** Read-only access to documents */
    VIEWER = 'VIEWER'
}

/**
 * Permission strings for granular access control
 */
export type Permission =
    // Document permissions
    | 'documents:read'
    | 'documents:create'
    | 'documents:update'
    | 'documents:delete'
    | 'documents:import'

    // Checklist permissions
    | 'checklists:read'
    | 'checklists:write'
    | 'checklists:execute'

    // Session permissions
    | 'sessions:read'
    | 'sessions:write'
    | 'sessions:delete'

    // Category management
    | 'categories:read'
    | 'categories:write'
    | 'categories:delete'

    // User management
    | 'users:read'
    | 'users:write'
    | 'users:delete'

    // Audit logs
    | 'audit:read'
    | 'audit:write';

/**
 * Role to permissions mapping
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
        // Full access to everything
        'documents:read',
        'documents:create',
        'documents:update',
        'documents:delete',
        'documents:import',

        'checklists:read',
        'checklists:write',
        'checklists:execute',

        'sessions:read',
        'sessions:write',
        'sessions:delete',

        'categories:read',
        'categories:write',
        'categories:delete',

        'users:read',
        'users:write',
        'users:delete',

        'audit:read',
        'audit:write'
    ],

    [Role.TECHNICIAN]: [
        // Can read documents and execute work
        'documents:read',
        'checklists:read',
        'checklists:execute',
        'sessions:read',
        'sessions:write',
        'categories:read'
    ],

    [Role.VIEWER]: [
        // Read-only access
        'documents:read',
        'checklists:read',
        'categories:read'
    ]
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Authorization error
 */
export class UnauthorizedError extends Error {
    constructor(message: string = 'Unauthorized access') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

/**
 * Get current user's role from session
 */
export async function getCurrentUserRole(): Promise<Role | null> {
    const session = await getServerSession(authOptions);
    return session?.user?.role as Role || null;
}

/**
 * Require user to have specific role(s)
 * 
 * @throws {UnauthorizedError} If user doesn't have required role
 */
export async function requireRole(allowedRoles: Role[]): Promise<Role> {
    const userRole = await getCurrentUserRole();

    if (!userRole) {
        throw new UnauthorizedError('Not authenticated');
    }

    if (!allowedRoles.includes(userRole)) {
        throw new UnauthorizedError(
            `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
    }

    return userRole;
}

/**
 * Require user to have specific permission(s)
 * 
 * @throws {UnauthorizedError} If user doesn't have required permission
 */
export async function requirePermission(
    requiredPermissions: Permission | Permission[]
): Promise<Role> {
    const userRole = await getCurrentUserRole();

    if (!userRole) {
        throw new UnauthorizedError('Not authenticated');
    }

    const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

    if (!hasAnyPermission(userRole, permissions)) {
        throw new UnauthorizedError(
            `Access denied. Required permissions: ${permissions.join(', ')}`
        );
    }

    return userRole;
}

/**
 * Check if current user can perform an action
 * Returns boolean instead of throwing
 */
export async function canPerform(permission: Permission): Promise<boolean> {
    const userRole = await getCurrentUserRole();
    if (!userRole) return false;
    return hasPermission(userRole, permission);
}

/**
 * Decorator for server actions that require specific role
 * 
 * @example
 * export const deleteDocument = withRole([Role.ADMIN], async (formData) => {
 *   // Only admins can execute this
 * });
 */
export function withRole<T extends any[], R>(
    allowedRoles: Role[],
    action: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<R> => {
        await requireRole(allowedRoles);
        return action(...args);
    };
}

/**
 * Decorator for server actions that require specific permission
 * 
 * @example
 * export const createDocument = withPermission('documents:create', async (formData) => {
 *   // Only users with documents:create permission can execute
 * });
 */
export function withPermission<T extends any[], R>(
    requiredPermissions: Permission | Permission[],
    action: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<R> => {
        await requirePermission(requiredPermissions);
        return action(...args);
    };
}

/**
 * Middleware helper for route protection
 * 
 * @example
 * // In middleware.ts
 * if (isAdminRoute(pathname)) {
 *   const hasAccess = await checkRouteAccess(pathname, session);
 *   if (!hasAccess) return NextResponse.redirect('/unauthorized');
 * }
 */
export function checkRouteAccess(pathname: string, userRole: Role | null): boolean {
    // Admin routes
    if (pathname.startsWith('/admin')) {
        return userRole === Role.ADMIN;
    }

    // Technician routes
    if (pathname.startsWith('/sessions') || pathname.startsWith('/checklists')) {
        return userRole === Role.ADMIN || userRole === Role.TECHNICIAN;
    }

    // Public routes (search, docs view)
    if (pathname.startsWith('/search') || pathname.startsWith('/docs/')) {
        return true; // All authenticated users
    }

    return false;
}
