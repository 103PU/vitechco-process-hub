import { updateUserRole, deleteUser } from './actions';
import { prisma } from '@/lib/prisma/client';
import { getServerSession } from 'next-auth';
import { Role } from '@prisma/client';

// Mock dependencies
jest.mock('@/lib/prisma/client', () => ({
  prisma: {
    user: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/features/auth/config/authOptions', () => ({
  authOptions: {},
}));

describe('User Actions Security Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserRole', () => {
    it('Should BLOCK non-admin users', async () => {
      // Mock TECHNICIAN session
      (getServerSession as jest.Mock).mockResolvedValue({ 
        user: { id: 'tech-1', role: 'TECHNICIAN' } 
      });

      const result = await updateUserRole('target-user', 'ADMIN');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('Should BLOCK admin from modifying themselves', async () => {
      // Mock ADMIN session
      (getServerSession as jest.Mock).mockResolvedValue({ 
        user: { id: 'admin-1', role: 'ADMIN' } 
      });

      const result = await updateUserRole('admin-1', 'TECHNICIAN'); // Target same ID

      expect(result.success).toBe(false);
      expect(result.error).toContain('không thể tự thay đổi');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('Should ALLOW admin to modify other users', async () => {
      // Mock ADMIN session
      (getServerSession as jest.Mock).mockResolvedValue({ 
        user: { id: 'admin-1', role: 'ADMIN' } 
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await updateUserRole('other-user', 'ADMIN');

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('Should BLOCK non-admin users', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ 
        user: { id: 'tech-1', role: 'TECHNICIAN' } 
      });

      const result = await deleteUser('target-user');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('Should ALLOW admin to delete other users', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ 
        user: { id: 'admin-1', role: 'ADMIN' } 
      });

      (prisma.user.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteUser('target-user');

      expect(result.success).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalled();
    });
  });
});
