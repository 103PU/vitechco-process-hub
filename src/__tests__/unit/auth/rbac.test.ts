import { describe, it, expect, beforeEach } from 'vitest';
import {
    Role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    ROLE_PERMISSIONS
} from '@/lib/auth/rbac';

describe('RBAC System', () => {
    describe('Role Permissions', () => {
        it('should define all required roles', () => {
            expect(Role.ADMIN).toBe('ADMIN');
            expect(Role.TECHNICIAN).toBe('TECHNICIAN');
            expect(Role.VIEWER).toBe('VIEWER');
        });

        it('should have permissions for all roles', () => {
            expect(ROLE_PERMISSIONS[Role.ADMIN]).toBeDefined();
            expect(ROLE_PERMISSIONS[Role.TECHNICIAN]).toBeDefined();
            expect(ROLE_PERMISSIONS[Role.VIEWER]).toBeDefined();
        });

        it('ADMIN should have all permissions', () => {
            const adminPerms = ROLE_PERMISSIONS[Role.ADMIN];

            expect(adminPerms).toContain('documents:read');
            expect(adminPerms).toContain('documents:create');
            expect(adminPerms).toContain('documents:update');
            expect(adminPerms).toContain('documents:delete');
            expect(adminPerms).toContain('users:write');
            expect(adminPerms).toContain('categories:delete');
        });

        it('TECHNICIAN should have read and execute permissions', () => {
            const techPerms = ROLE_PERMISSIONS[Role.TECHNICIAN];

            expect(techPerms).toContain('documents:read');
            expect(techPerms).toContain('checklists:execute');
            expect(techPerms).toContain('sessions:write');

            // Should NOT have admin permissions
            expect(techPerms).not.toContain('documents:delete');
            expect(techPerms).not.toContain('users:write');
        });

        it('VIEWER should have read-only permissions', () => {
            const viewerPerms = ROLE_PERMISSIONS[Role.VIEWER];

            expect(viewerPerms).toContain('documents:read');
            expect(viewerPerms).toContain('checklists:read');

            // Should NOT have write permissions
            expect(viewerPerms).not.toContain('documents:create');
            expect(viewerPerms).not.toContain('checklists:write');
            expect(viewerPerms).not.toContain('sessions:write');
        });
    });

    describe('hasPermission', () => {
        it('should return true for valid permission', () => {
            expect(hasPermission(Role.ADMIN, 'documents:read')).toBe(true);
            expect(hasPermission(Role.TECHNICIAN, 'checklists:execute')).toBe(true);
            expect(hasPermission(Role.VIEWER, 'documents:read')).toBe(true);
        });

        it('should return false for invalid permission', () => {
            expect(hasPermission(Role.VIEWER, 'documents:delete')).toBe(false);
            expect(hasPermission(Role.TECHNICIAN, 'users:write')).toBe(false);
        });

        it('should handle document permissions correctly', () => {
            // ADMIN can do everything
            expect(hasPermission(Role.ADMIN, 'documents:create')).toBe(true);
            expect(hasPermission(Role.ADMIN, 'documents:delete')).toBe(true);

            // TECHNICIAN can read but not delete
            expect(hasPermission(Role.TECHNICIAN, 'documents:read')).toBe(true);
            expect(hasPermission(Role.TECHNICIAN, 'documents:delete')).toBe(false);

            // VIEWER can only read
            expect(hasPermission(Role.VIEWER, 'documents:read')).toBe(true);
            expect(hasPermission(Role.VIEWER, 'documents:create')).toBe(false);
        });
    });

    describe('hasAnyPermission', () => {
        it('should return true if role has at least one permission', () => {
            expect(hasAnyPermission(Role.ADMIN, [
                'documents:read',
                'documents:create'
            ])).toBe(true);

            expect(hasAnyPermission(Role.TECHNICIAN, [
                'documents:read',
                'users:write' // Doesn't have this
            ])).toBe(true); // But has documents:read
        });

        it('should return false if role has none of the permissions', () => {
            expect(hasAnyPermission(Role.VIEWER, [
                'documents:delete',
                'users:write'
            ])).toBe(false);
        });

        it('should handle empty permissions array', () => {
            expect(hasAnyPermission(Role.ADMIN, [])).toBe(false);
        });
    });

    describe('hasAllPermissions', () => {
        it('should return true if role has all permissions', () => {
            expect(hasAllPermissions(Role.ADMIN, [
                'documents:read',
                'documents:create',
                'documents:delete'
            ])).toBe(true);

            expect(hasAllPermissions(Role.TECHNICIAN, [
                'documents:read',
                'checklists:execute'
            ])).toBe(true);
        });

        it('should return false if role is missing any permission', () => {
            expect(hasAllPermissions(Role.TECHNICIAN, [
                'documents:read',
                'documents:delete' // Missing this
            ])).toBe(false);
        });

        it('should handle single permission', () => {
            expect(hasAllPermissions(Role.VIEWER, ['documents:read'])).toBe(true);
            expect(hasAllPermissions(Role.VIEWER, ['documents:create'])).toBe(false);
        });

        it('should handle empty permissions array', () => {
            expect(hasAllPermissions(Role.ADMIN, [])).toBe(true);
        });
    });

    describe('Permission Hierarchy', () => {
        it('ADMIN should have more permissions than TECHNICIAN', () => {
            const adminCount = ROLE_PERMISSIONS[Role.ADMIN].length;
            const techCount = ROLE_PERMISSIONS[Role.TECHNICIAN].length;

            expect(adminCount).toBeGreaterThan(techCount);
        });

        it('TECHNICIAN should have more permissions than VIEWER', () => {
            const techCount = ROLE_PERMISSIONS[Role.TECHNICIAN].length;
            const viewerCount = ROLE_PERMISSIONS[Role.VIEWER].length;

            expect(techCount).toBeGreaterThan(viewerCount);
        });

        it('all VIEWER permissions should be in TECHNICIAN', () => {
            const viewerPerms = ROLE_PERMISSIONS[Role.VIEWER];
            const techPerms = ROLE_PERMISSIONS[Role.TECHNICIAN];

            viewerPerms.forEach(perm => {
                expect(techPerms).toContain(perm);
            });
        });

        it('all TECHNICIAN permissions should be in ADMIN', () => {
            const techPerms = ROLE_PERMISSIONS[Role.TECHNICIAN];
            const adminPerms = ROLE_PERMISSIONS[Role.ADMIN];

            techPerms.forEach(perm => {
                expect(adminPerms).toContain(perm);
            });
        });
    });

    describe('Critical Permissions', () => {
        it('only ADMIN can delete users', () => {
            expect(hasPermission(Role.ADMIN, 'users:delete')).toBe(true);
            expect(hasPermission(Role.TECHNICIAN, 'users:delete')).toBe(false);
            expect(hasPermission(Role.VIEWER, 'users:delete')).toBe(false);
        });

        it('only ADMIN can import documents', () => {
            expect(hasPermission(Role.ADMIN, 'documents:import')).toBe(true);
            expect(hasPermission(Role.TECHNICIAN, 'documents:import')).toBe(false);
            expect(hasPermission(Role.VIEWER, 'documents:import')).toBe(false);
        });

        it('TECHNICIAN and ADMIN can write sessions', () => {
            expect(hasPermission(Role.ADMIN, 'sessions:write')).toBe(true);
            expect(hasPermission(Role.TECHNICIAN, 'sessions:write')).toBe(true);
            expect(hasPermission(Role.VIEWER, 'sessions:write')).toBe(false);
        });

        it('all roles can read documents', () => {
            expect(hasPermission(Role.ADMIN, 'documents:read')).toBe(true);
            expect(hasPermission(Role.TECHNICIAN, 'documents:read')).toBe(true);
            expect(hasPermission(Role.VIEWER, 'documents:read')).toBe(true);
        });
    });
});
