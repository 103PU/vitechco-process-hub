import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';

export class DocumentService {
  static async getAll(searchTerm: string = '') {
    const docs = await prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
        ],
      },
      include: {
        departments: { include: { department: true } },
        technicalMetadata: {
          include: {
            documentType: true,
            topic: true,
            machineModels: { include: { machineModel: { include: { brand: true } } } },
            tags: { include: { tag: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mapper
    return docs.map(doc => ({
      ...doc,
      documentType: doc.technicalMetadata?.documentType ?? null,
      documentTypeId: doc.technicalMetadata?.documentTypeId ?? null,
      topic: doc.technicalMetadata?.topic ?? null,
      topicId: doc.technicalMetadata?.topicId ?? null,
      machineModels: doc.technicalMetadata?.machineModels ?? [],
      tags: doc.technicalMetadata?.tags ?? [],
      technicalMetadata: undefined
    }));
  }

  static async getById(id: string) {
    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        departments: { include: { department: true } },
        technicalMetadata: {
          include: {
            documentType: true,
            topic: true,
            tags: { include: { tag: true } },
            machineModels: { include: { machineModel: { include: { brand: true } } } },
            steps: { orderBy: { order: 'asc' } }
          }
        }
      }
    });

    if (!doc) return null;

    return {
      ...doc,
      documentType: doc.technicalMetadata?.documentType ?? null,
      documentTypeId: doc.technicalMetadata?.documentTypeId ?? null,
      topic: doc.technicalMetadata?.topic ?? null,
      topicId: doc.technicalMetadata?.topicId ?? null,
      tags: doc.technicalMetadata?.tags ?? [],
      machineModels: doc.technicalMetadata?.machineModels ?? [],
      steps: doc.technicalMetadata?.steps ?? [],
      technicalMetadata: undefined
    };
  }


  static async create(data: Prisma.DocumentCreateInput) {
    return prisma.document.create({ data });
  }


  static async update(id: string, data: Prisma.DocumentUpdateInput) {
    return prisma.document.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.document.delete({ where: { id } });
  }

  static async deleteMany(ids: string[]) {
    return prisma.document.deleteMany({
      where: { id: { in: ids } }
    });
  }
}
