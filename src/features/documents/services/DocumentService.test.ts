import { DocumentService } from './DocumentService';
import { prisma } from '@/lib/prisma/client';
import { vi, describe, it, expect } from 'vitest';

// Mocking Prisma Client
vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    document: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: '1', title: 'Test Doc' }),
      update: vi.fn().mockResolvedValue({ id: '1', title: 'Updated Doc' }),
      delete: vi.fn().mockResolvedValue({ id: '1' }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

describe('DocumentService', () => {
  it('should call prisma.document.findMany when getAll is called', async () => {
    await DocumentService.getAll();
    expect(prisma.document.findMany).toHaveBeenCalled();
  });

  it('should call prisma.document.create when create is called', async () => {
    const mockData = { title: 'Test Doc', content: 'Content', documentTypeId: '123' };
    await DocumentService.create(mockData);
    expect(prisma.document.create).toHaveBeenCalledWith({ data: mockData });
  });
});
