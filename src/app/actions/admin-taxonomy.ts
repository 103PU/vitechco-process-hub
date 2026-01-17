'use server';

import { PrismaClient, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { withRole, Role } from '@/lib/auth/rbac';

const prisma = new PrismaClient();

// --- BRANDS ---
const brandSchema = z.object({
    name: z.string().min(1, "Tên thương hiệu không được để trống"),
});

export async function getBrands() {
    return await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                _count: {
                    select: { machineModels: true }
                }
            }
        }
    });
}

export const createBrand = withRole([Role.ADMIN], async (formData: FormData) => {
    const name = formData.get('name') as string;
    const validated = brandSchema.safeParse({ name });

    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    try {
        await prisma.brand.create({ data: { name: validated.data.name } });
        revalidatePath('/admin/brands');
        return { success: true };
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return { success: false, error: 'Thương hiệu đã tồn tại.' };
        return { success: false, error: 'Lỗi hệ thống.' };
    }
});

export const deleteBrand = withRole([Role.ADMIN], async (id: string) => {
    try {
        await prisma.brand.delete({ where: { id } });
        revalidatePath('/admin/brands');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Không thể xóa thương hiệu đang có dòng máy liên kết.' };
    }
});

// --- TAGS ---
const tagSchema = z.object({
    name: z.string().min(1, "Tên thẻ không được để trống"),
});

export async function getTags() {
    return await prisma.tag.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { technicalMetadataList: true }
            }
        }
    });
}

export const createTag = withRole([Role.ADMIN], async (formData: FormData) => {
    const name = formData.get('name') as string;
    const validated = tagSchema.safeParse({ name });

    if (!validated.success) return { success: false, error: validated.error.issues[0].message };

    try {
        await prisma.tag.create({ data: { name: validated.data.name } });
        revalidatePath('/admin/tags');
        return { success: true };
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return { success: false, error: 'Thẻ đã tồn tại.' };
        return { success: false, error: 'Lỗi hệ thống.' };
    }
});

export const deleteTag = withRole([Role.ADMIN], async (id: string) => {
    try {
        await prisma.tag.delete({ where: { id } });
        revalidatePath('/admin/tags');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Không thể xóa thẻ đang được sử dụng.' };
    }
});
