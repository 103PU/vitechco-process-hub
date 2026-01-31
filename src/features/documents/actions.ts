'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma/client'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/features/auth/config/authOptions'
import { Prisma } from '@prisma/client'
import slugify from 'slugify'

import { FullDocument } from './utils/doc-grouping';

const documentSchema = z.object({
    title: z.string().min(3, { message: "Tiêu đề phải có ít nhất 3 ký tự" }),
    content: z.string().min(10, { message: "Nội dung phải có ít nhất 10 ký tự" }),
    documentTypeId: z.string(),
    topicId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    departmentIds: z.array(z.string()).optional(),
    machineModelIds: z.array(z.string()).optional(),
})

// ... (getDocumentsForHome remains unchanged)

export async function createDocument(data: unknown) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    const parsed = documentSchema.safeParse(data);

    if (!parsed.success) {
        // Return generic error as required by Test Case TC-002
        return { success: false, error: "Dữ liệu không hợp lệ." };
    }

    const { title, content, documentTypeId, topicId, tagIds, departmentIds, machineModelIds } = parsed.data;

    try {
        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Create Core Document
            const doc = await tx.document.create({
                data: {
                    title,
                    content,
                    departments: departmentIds?.length ? {
                        create: departmentIds.map(id => ({ department: { connect: { id } } }))
                    } : undefined,
                    // Note: No technical fields here anymore
                }
            });

            // 2. Create Technical Metadata Extension
            await tx.technicalMetadata.create({
                data: {
                    documentId: doc.id,
                    documentTypeId, // Nullable in schema? Schema says String? so ok.
                    topicId, // Enforcing hierarchy
                    tags: tagIds?.length ? {
                        create: tagIds.map(id => ({ tag: { connect: { id } } }))
                    } : undefined,
                    machineModels: machineModelIds?.length ? {
                        create: machineModelIds.map(id => ({ machineModel: { connect: { id } } }))
                    } : undefined,
                }
            });
        });

        revalidatePath('/admin/documents');
        return { success: true };

    } catch (error) {
        console.error("Failed to create document:", error);
        return { success: false, error: "Không thể tạo quy trình." };
    }
}

export async function updateDocument(id: string, data: unknown) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    const parsed = documentSchema.safeParse(data);

    if (!parsed.success) {
        return { success: false, error: "Dữ liệu không hợp lệ." };
    }

    const { title, content, documentTypeId, topicId, tagIds, departmentIds, machineModelIds } = parsed.data;

    try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Update Core Info
            await tx.document.update({
                where: { id },
                data: { title, content }
            });

            // 2. Ensure Technical Metadata Exists (Upsert preferred if missing, checking existence is safer)
            // Ideally it exists, but for old docs migrated it should.
            // We use upsert on the 1-1 relation.

            // Wait, TechnicalMetadata has its own ID. We link by documentId.
            // Upsert syntax on relation:
            await tx.technicalMetadata.upsert({
                where: { documentId: id },
                create: {
                    documentId: id,
                    documentTypeId,
                    topicId,
                    // For new creation via update -> we might miss relations if we don't connect them here
                    // But typically update handles them below.
                },
                update: {
                    documentTypeId,
                    topicId
                }
            });

            // Get Metadata ID to update relations
            const metadata = await tx.technicalMetadata.findUniqueOrThrow({ where: { documentId: id } });

            // 3. Sync Tags (On Metadata)
            if (tagIds) {
                await tx.documentOnTag.deleteMany({ where: { technicalMetadataId: metadata.id } }); // Note: FK Changed
                if (tagIds.length > 0) {
                    // Need to map to technicalMetadataId
                    await tx.documentOnTag.createMany({
                        data: tagIds.map(tagId => ({ technicalMetadataId: metadata.id, tagId }))
                    });
                }
            }

            // 4. Sync Departments (On Core)
            if (departmentIds) {
                await tx.documentOnDepartment.deleteMany({ where: { documentId: id } });
                if (departmentIds.length > 0) {
                    await tx.documentOnDepartment.createMany({
                        data: departmentIds.map(departmentId => ({ documentId: id, departmentId }))
                    });
                }
            }

            // 5. Sync Machine Models (On Metadata)
            if (machineModelIds) {
                await tx.documentOnMachineModel.deleteMany({ where: { technicalMetadataId: metadata.id } });
                if (machineModelIds.length > 0) {
                    await tx.documentOnMachineModel.createMany({
                        data: machineModelIds.map(machineModelId => ({ technicalMetadataId: metadata.id, machineModelId }))
                    });
                }
            }
        });

        revalidatePath('/admin/documents');
        revalidatePath(`/admin/documents/edit/${id}`);
        return { success: true };

    } catch (error) {
        console.error("Failed to update document:", error);
        return { success: false, error: "Không thể cập nhật quy trình." };
    }
}

export async function deleteDocument(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    try {
        await prisma.document.delete({
            where: { id },
        })
        revalidatePath('/admin/documents')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete document:', error)
        return { success: false, error: 'Failed to delete document.' }
    }
}

export async function deleteDocuments(ids: string[]) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    try {
        await prisma.document.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        })
        revalidatePath('/admin/documents')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete documents:', error)
        return { success: false, error: 'Failed to delete documents.' }
    }
}

// --- Tag Actions ---

export async function getAllTags() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
        });
        return { success: true, tags };
    } catch (error) {
        console.error('Failed to get tags:', error);
        return { success: false, tags: [] };
    }
}

export async function createTag(name: string) {
    try {
        await prisma.tag.create({ data: { name } });
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to create tag' };
    }
}

export async function updateTag(id: string, name: string) {
    try {
        await prisma.tag.update({ where: { id }, data: { name } });
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to update tag' };
    }
}

export async function deleteTag(id: string) {
    try {
        await prisma.tag.delete({ where: { id } });
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to delete tag' };
    }
}

export async function updateDocumentTags(documentIds: string[], tagNames: string[]) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    if (!documentIds || documentIds.length === 0) {
        return { success: false, error: 'No document IDs provided.' };
    }

    try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const tags = await Promise.all(tagNames.map(name =>
                tx.tag.upsert({
                    where: { name },
                    update: {},
                    create: { name },
                })
            ));
            const tagIds = tags.map(t => t.id);

            for (const documentId of documentIds) {
                // Ensure Metadata Exists
                const metadata = await tx.technicalMetadata.findUnique({ where: { documentId } });
                if (!metadata) {
                    // Should create if missing?
                    // For bulk actions, ignoring missing metadata might be safer or creating empty one.
                    // Let's create empty one.
                    await tx.technicalMetadata.create({ data: { documentId } });
                }
                const metaId = (await tx.technicalMetadata.findUniqueOrThrow({ where: { documentId } })).id;

                await tx.documentOnTag.deleteMany({
                    where: { technicalMetadataId: metaId }
                });

                if (tagIds.length > 0) {
                    await tx.documentOnTag.createMany({
                        data: tagIds.map(tagId => ({
                            technicalMetadataId: metaId,
                            tagId
                        }))
                    });
                }
            }
        });

        revalidatePath('/admin/documents');
        return { success: true };

    } catch (error) {
        console.error('Failed to update document tags:', error);
        return { success: false, error: 'Failed to update tags.' };
    }
}

// --- Department Actions ---

export async function getAllDepartments() {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { name: 'asc' },
        });
        return { success: true, departments };
    } catch (error) {
        console.error('Failed to get departments:', error);
        return { success: false, departments: [] };
    }
}

export async function createDepartment(name: string) {
    try {
        await prisma.department.create({ data: { name } });
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to create department' };
    }
}

export async function updateDepartment(id: string, name: string) {
    try {
        await prisma.department.update({ where: { id }, data: { name } });
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to update department' };
    }
}

export async function deleteDepartment(id: string) {
    try {
        await prisma.department.delete({ where: { id } });
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to delete department' };
    }
}

export async function updateDocumentDepartments(documentIds: string[], departmentNames: string[]) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    if (!documentIds || documentIds.length === 0) {
        return { success: false, error: 'No document IDs provided.' };
    }

    try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const depts = await Promise.all(departmentNames.map(name =>
                tx.department.upsert({
                    where: { name },
                    update: {},
                    create: { name },
                })
            ));
            const deptIds = depts.map(d => d.id);

            for (const documentId of documentIds) {
                await tx.documentOnDepartment.deleteMany({
                    where: { documentId }
                });

                if (deptIds.length > 0) {
                    await tx.documentOnDepartment.createMany({
                        data: deptIds.map(departmentId => ({
                            documentId,
                            departmentId
                        }))
                    });
                }
            }
        });

        revalidatePath('/admin/documents');
        return { success: true };

    } catch (error) {
        console.error('Failed to update document departments:', error);
        return { success: false, error: 'Failed to update departments.' };
    }
}

// --- Document Type Actions ---

// --- Document Type Actions ---

export async function getAllTopics() {
    try {
        const topics = await prisma.documentTopic.findMany({
            orderBy: { name: 'asc' },
            include: { category: true } // Include category name
        });
        return { success: true, topics };
    } catch (error) {
        console.error('Failed to get topics:', error);
        return { success: false, topics: [] };
    }
}

export async function createTopic(name: string, categoryId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const slug = slugify(`${name}`, { lower: true, strict: true });
        // Handle potential duplicate slugs by appending random string if needed, 
        // but for now relying on user to provide unique names per category

        await prisma.documentTopic.create({
            data: {
                name,
                categoryId,
                slug: `${slug}-${Date.now()}` // Ensure uniqueness roughly
            }
        });
        revalidatePath('/admin/documents');
        return { success: true };
    } catch (error) {
        console.error('Failed to create topic:', error);
        return { success: false, error: 'Failed to create topic' };
    }
}

export async function updateTopic(id: string, name: string, categoryId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await prisma.documentTopic.update({
            where: { id },
            data: { name, categoryId }
        });
        revalidatePath('/admin/documents');
        return { success: true };
    } catch (error) {
        console.error('Failed to update topic:', error);
        return { success: false, error: 'Failed to update topic' };
    }
}

export async function deleteTopic(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        await prisma.documentTopic.delete({ where: { id } });
        revalidatePath('/admin/documents');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete topic:', error);
        return { success: false, error: 'Failed to delete topic' };
    }
}

export async function updateDocumentTopicRelation(documentIds: string[], topicId: string) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    if (!documentIds || documentIds.length === 0 || !topicId) {
        return { success: false, error: 'Invalid input.' };
    }

    try {
        await prisma.$transaction(async (tx) => {
            for (const documentId of documentIds) {
                await tx.technicalMetadata.upsert({
                    where: { documentId },
                    create: { documentId, topicId },
                    update: { topicId }
                });
            }
        });

        revalidatePath('/admin/documents');
        return { success: true };
    } catch (error) {
        console.error('Failed to update document topic relation:', error);
        return { success: false, error: 'Failed to update topic.' };
    }
}

export async function getAllDocumentTypes() {
    try {
        const types = await prisma.documentType.findMany({
            orderBy: { name: 'asc' },
        });
        return { success: true, types };
    } catch (error) {
        console.error('Failed to get document types:', error);
        return { success: false, types: [] };
    }
}

export async function updateDocumentTypeRelation(documentIds: string[], typeId: string) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    if (!documentIds || documentIds.length === 0 || !typeId) {
        return { success: false, error: 'Invalid input.' };
    }

    try {
        await prisma.$transaction(async (tx) => {
            for (const documentId of documentIds) {
                await tx.technicalMetadata.upsert({
                    where: { documentId },
                    create: { documentId, documentTypeId: typeId },
                    update: { documentTypeId: typeId }
                });
            }
        });

        revalidatePath('/admin/documents');
        return { success: true };
    } catch (error) {
        console.error('Failed to update document type relation:', error);
        return { success: false, error: 'Failed to update type.' };
    }
}

export async function createDocumentType(name: string) {
    try {
        await prisma.documentType.create({ data: { name } });
        return { success: true };
    } catch (error) {
        console.error('Failed to create document type:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { success: false, error: 'Tên loại văn bản đã tồn tại.' };
        }
        return { success: false, error: 'Failed to create document type' };
    }
}

export async function updateDocumentType(id: string, name: string) {
    try {
        await prisma.documentType.update({ where: { id }, data: { name } });
        return { success: true };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { success: false, error: 'Tên loại văn bản đã tồn tại.' };
        }
        return { success: false, error: 'Failed to update document type' };
    }
}

export async function deleteDocumentType(id: string) {
    try {
        await prisma.documentType.delete({ where: { id } });
        return { success: true };
    } catch {
        return { success: false, error: 'Failed to delete document type' };
    }
}

// --- Step Actions ---

export async function updateSteps(documentId: string, steps: { id?: string, description: string, order: number }[]) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Ensure Metadata
            let metadata = await tx.technicalMetadata.findUnique({ where: { documentId } });
            if (!metadata) {
                metadata = await tx.technicalMetadata.create({ data: { documentId } });
            }
            const metaId = metadata.id;

            type StepRecord = Awaited<ReturnType<typeof tx.step.findMany>>[number];
            const existingSteps = await tx.step.findMany({ where: { technicalMetadataId: metaId } });
            const incomingStepIds = steps.map((s: { id?: string }) => s.id).filter(Boolean) as string[];

            // Delete steps that are no longer present
            const stepsToDelete = existingSteps.filter((s: StepRecord) => !incomingStepIds.includes(s.id));
            if (stepsToDelete.length > 0) {
                await tx.step.deleteMany({
                    where: { id: { in: stepsToDelete.map((s: StepRecord) => s.id) } },
                });
            }

            // Upsert steps
            for (const step of steps) {
                if (step.id && !step.id.startsWith('new-')) {
                    await tx.step.update({
                        where: { id: step.id },
                        data: { description: step.description, order: step.order },
                    });
                } else {
                    await tx.step.create({
                        data: {
                            technicalMetadataId: metaId, // Changed FK
                            description: step.description,
                            order: step.order,
                        },
                    });
                }
            }
        });

        revalidatePath(`/admin/documents/edit/${documentId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update steps:", error);
        return { success: false, error: "Không thể cập nhật các bước." };
    }
}