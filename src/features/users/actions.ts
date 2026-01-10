'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/features/auth/config/authOptions'
import { Role } from '@prisma/client'

export async function updateUserRole(userId: string, newRole: Role) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    
    // Security check: Only admins can change roles
    if (role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' };
    }

    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Prevent admin from de-moting themselves (safety feature)
    const actorId = (session.user as any)?.id;
    if (actorId === userId) {
        return { success: false, error: 'Bạn không thể tự thay đổi vai trò của chính mình.' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to update role:', error);
        return { success: false, error: 'Lỗi khi cập nhật vai trò.' };
    }
}

export async function deleteUser(userId: string) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    
    if (role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' };
    }

    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    const actorId = (session.user as any)?.id;
    if (actorId === userId) {
        return { success: false, error: 'Bạn không thể xóa chính mình.' };
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, error: 'Lỗi khi xóa người dùng.' };
    }
}
