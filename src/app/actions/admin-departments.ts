'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { withRole, Role } from '@/lib/auth/rbac';

const prisma = new PrismaClient();

const departmentSchema = z.object({
    name: z.string().min(2, "Tên phòng ban phải có ít nhất 2 ký tự"),
    code: z.string().min(2, "Mã phòng ban phải có ít nhất 2 ký tự"),
    description: z.string().optional(),
});

export async function getDepartments() {
    return await prisma.department.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { documents: true }
            }
        }
    });
}

export const createDepartment = withRole([Role.ADMIN], async (formData: FormData) => {
    const data = {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        description: formData.get('description') as string,
    };

    const validated = departmentSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message };
    }

    try {
        await prisma.department.create({
            data: {
                name: validated.data.name,
                code: validated.data.code,
                description: validated.data.description,
            } as any
        });
        revalidatePath('/admin/departments');
        return { success: true };
    } catch (e: any) {
        if (e.code === 'P2002') return { success: false, error: 'Mã hoặc tên phòng ban đã tồn tại.' };
        return { success: false, error: 'Lỗi hệ thống.' };
    }
});

export const deleteDepartment = withRole([Role.ADMIN], async (id: string) => {
    try {
        await prisma.department.delete({ where: { id } });
        revalidatePath('/admin/departments');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Không thể xóa phòng ban đang có tài liệu.' };
    }
});
