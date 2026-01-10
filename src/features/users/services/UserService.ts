import { prisma } from '@/lib/prisma/client';
import { Role } from '@prisma/client';

export class UserService {
  static async getAll() {
    return prisma.user.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });
  }

  static async updateRole(userId: string, newRole: Role) {
    return prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });
  }

  static async delete(userId: string) {
    return prisma.user.delete({
        where: { id: userId }
    });
  }
}
