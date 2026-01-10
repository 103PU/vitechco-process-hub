import { DocumentService } from './DocumentService';
import { prisma } from '@/lib/prisma/client';

// Mocking Prisma Client
jest.mock('@/lib/prisma/client', () => ({
  prisma: {
    document: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
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
