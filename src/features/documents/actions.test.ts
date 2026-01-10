import { createDocument, updateDocument, updateDocumentTags } from './actions';
import { prisma } from '@/lib/prisma/client';
import { getServerSession } from 'next-auth';

// Mock the dependencies
jest.mock('@/lib/prisma/client', () => ({
  prisma: {
    document: {
      create: jest.fn(),
      update: jest.fn(),
    },
    tag: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
    documentOnTag: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    }
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

describe('Document Actions Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDocument (Security & Logic)', () => {
    it('TC-101: Should BLOCK unauthenticated users (Security Check)', async () => {
      // Simulate NO session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const validData = {
        title: 'Valid Document Title',
        content: 'This is valid content > 10 chars',
        documentTypeId: 'type-123',
      };

      const result = await createDocument(validData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Bạn cần đăng nhập");
      expect(prisma.document.create).not.toHaveBeenCalled();
    });

    it('TC-001: Should ALLOW authorized users to create documents', async () => {
      // Simulate VALID session
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });

      const validData = {
        title: 'Valid Document Title',
        content: 'This is valid content > 10 chars',
        documentTypeId: 'type-123',
      };
      
      (prisma.document.create as jest.Mock).mockResolvedValue(validData);

      const result = await createDocument(validData);

      expect(result.success).toBe(true);
      expect(prisma.document.create).toHaveBeenCalledWith({ data: validData });
    });

    it('TC-003: Should create document with relations (Tags, Depts)', async () => {
      // Simulate VALID session
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });

      const complexData = {
        title: 'Complex Doc',
        content: 'Content...',
        documentTypeId: 'type-1',
        tagIds: ['tag-1', 'tag-2'],
        departmentIds: ['dept-1'],
        machineModelIds: []
      };
      
      (prisma.document.create as jest.Mock).mockResolvedValue({ id: 'new-id' });

      const result = await createDocument(complexData);

      expect(result.success).toBe(true);
      
      // Verify the nested create structure
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Complex Doc',
          tags: {
            create: [
              { tag: { connect: { id: 'tag-1' } } },
              { tag: { connect: { id: 'tag-2' } } }
            ]
          },
          departments: {
            create: [
              { department: { connect: { id: 'dept-1' } } }
            ]
          }
        })
      });
    });

    it('TC-002: Should fail validation if title is too short (Authorized)', async () => {
      // Simulate VALID session
      (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });

      const invalidData = {
        title: 'No', // < 3 chars
        content: 'Valid content here',
        documentTypeId: 'type-123',
      };

      const result = await createDocument(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Dữ liệu không hợp lệ.");
      expect(prisma.document.create).not.toHaveBeenCalled();
    });
  });

  describe('updateDocumentTags (TC-004)', () => {
    it('TC-004: Should execute transaction to update tags (Authorized)', async () => {
        // Simulate VALID session
        (getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1' } });

        const docIds = ['doc-1'];
        const tagNames = ['Tag A', 'Tag B'];

        // Mock transaction behavior
        (prisma.tag.upsert as jest.Mock).mockResolvedValue({ id: 'tag-id' });
        
        const result = await updateDocumentTags(docIds, tagNames);

        expect(prisma.$transaction).toHaveBeenCalled();
        expect(result.success).toBe(true);
    });

    it('Should block unauthenticated tag updates', async () => {
        // Simulate NO session
        (getServerSession as jest.Mock).mockResolvedValue(null);
        
        const result = await updateDocumentTags(['doc-1'], ['Tag A']);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain("Bạn cần đăng nhập");
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
