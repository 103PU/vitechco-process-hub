import { updateUserRole, deleteUser } from './actions';
import { Role } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma/client';
import { getServerSession } from 'next-auth';
import { vi, describe, beforeEach, it, expect } from 'vitest';


// Mock dependencies
vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    user: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/features/auth/config/authOptions', () => ({
  authOptions: {},
}));

describe('User Actions Security Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateUserRole', () => {
    it('Should BLOCK non-admin users', async () => {
      // Mock TECHNICIAN session
      (getServerSession as any).mockResolvedValue({
        user: { id: 'tech-1', role: Role.TECHNICIAN }
      });

      const result = await updateUserRole('target-user', Role.ADMIN);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('Should BLOCK admin from modifying themselves', async () => {
      // Mock ADMIN session
      (getServerSession as any).mockResolvedValue({
        user: { id: 'admin-1', role: Role.ADMIN }
      });

      const result = await updateUserRole('admin-1', Role.TECHNICIAN); // Target same ID

      expect(result.success).toBe(false);
      expect(result.error).toContain('không thể tự thay đổi');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('Should ALLOW admin to modify other users', async () => {
      // Mock ADMIN session
      (getServerSession as any).mockResolvedValue({
        user: { id: 'admin-1', role: Role.ADMIN }
      });

      (prisma.user.update as any).mockResolvedValue({});

      const result = await updateUserRole('other-user', Role.ADMIN);

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('Should BLOCK non-admin users', async () => {
      (getServerSession as any).mockResolvedValue({
        user: { id: 'tech-1', role: Role.TECHNICIAN }
      });

      const result = await deleteUser('target-user');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('Should ALLOW admin to delete other users', async () => {
      (getServerSession as any).mockResolvedValue({
        user: { id: 'admin-1', role: Role.ADMIN }
      });

      (prisma.user.delete as any).mockResolvedValue({});

      const result = await deleteUser('target-user');

      expect(result.success).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalled();
    });
  });
});
