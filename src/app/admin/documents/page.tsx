import { DocumentService } from '@/features/documents/services/DocumentService';
import { columns, DocumentData } from '@/features/documents/components/table/columns';
import { DataTable } from '@/features/documents/components/table/data-table';
import { prisma } from '@/lib/prisma/client';
import { KNOWN_SERIES } from '@/lib/utils/text-processing';

async function getDocuments(): Promise<DocumentData[]> {
    const documents = await DocumentService.getAll();
    type Doc = Awaited<ReturnType<typeof DocumentService.getAll>>[number];
    return documents.map((doc: Doc) => ({
        id: doc.id,
        title: doc.title,
        documentType: doc.documentType?.name || null,
        topic: doc.topic?.name || null,
        updatedAt: doc.updatedAt.toISOString(),
        tags: doc.tags.map((t: Doc['tags'][number]) => t.tag),
        departments: doc.departments.map((d: Doc['departments'][number]) => d.department),
        machineModels: doc.machineModels.map((m) => ({
            name: m.machineModel.name,
            brand: m.machineModel.brand?.name || null
        }))
    }));
}

async function getDocumentTypes() {
    const types = await prisma.documentType.findMany({ select: { name: true }, distinct: ['name'] });
    return types.map((t: { name: string }) => ({ value: t.name, label: t.name }));
}

async function getTopics() {
    const topics = await prisma.documentTopic.findMany({ select: { name: true }, distinct: ['name'] });
    return topics.map((t: { name: string }) => ({ value: t.name, label: t.name }));
}

async function getDepartments() {
    const depts = await prisma.department.findMany({ select: { name: true }, distinct: ['name'] });
    return depts.map((d: { name: string }) => ({ value: d.name, label: d.name }));
}

async function getTags() {
    const tags = await prisma.tag.findMany({ select: { name: true }, distinct: ['name'] });
    const seriesSet = new Set(KNOWN_SERIES.map(s => s.toUpperCase()));
    return tags
        .filter(t => !seriesSet.has(t.name.toUpperCase()))
        .map((t: { name: string }) => ({ value: t.name, label: t.name }));
}

async function getBrands() {
    const brands = await prisma.brand.findMany({ select: { name: true }, distinct: ['name'] });
    return brands.map((b: { name: string }) => ({ value: b.name, label: b.name }));
}

async function getModels() {
    const models = await prisma.machineModel.findMany({ select: { name: true }, distinct: ['name'] });
    return models.map((m: { name: string }) => ({ value: m.name, label: m.name }));
}
export default async function AdminDocumentsPage() {
    const data = await getDocuments();
    const documentTypeOptions = await getDocumentTypes();
    const topicOptions = await getTopics();
    const departmentOptions = await getDepartments();
    const tagOptions = await getTags();
    const brandOptions = await getBrands();
    const modelOptions = await getModels();

    return (
        <section className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Quản lý Dữ liệu</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Hệ thống quản lý tài liệu kỹ thuật và thông số máy
                    </p>
                </div>
            </header>
            <DataTable
                columns={columns}
                data={data}
                documentTypeOptions={documentTypeOptions}
                topicOptions={topicOptions}
                departmentOptions={departmentOptions}
                tagOptions={tagOptions}
                brandOptions={brandOptions}
                modelOptions={modelOptions}
            />
        </section>
    )
}