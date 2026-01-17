import { DocumentService } from './DocumentService';
import { prisma } from '@/lib/prisma/client';
import { vi, describe, it, expect } from 'vitest';

// Mocking Prisma Client
vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    document: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
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
