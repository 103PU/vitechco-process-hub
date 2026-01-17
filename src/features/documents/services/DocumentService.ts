import { prisma } from '@/lib/prisma/client';

export class DocumentService {
  static async getAll(searchTerm: string = '') {
    return prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { content: { contains: searchTerm } },
        ],
      },
      include: {
        documentType: true,
        topic: true,
        machineModels: { include: { machineModel: { include: { brand: true } } } },
        tags: { include: { tag: true } },
        departments: { include: { department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        documentType: true,
        topic: true,
        tags: { include: { tag: true } },
        departments: { include: { department: true } },
        machineModels: { include: { machineModel: { include: { brand: true } } } },
        steps: { orderBy: { order: 'asc' } }
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async create(data: any) {
    return prisma.document.create({ data });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async update(id: string, data: any) {
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
