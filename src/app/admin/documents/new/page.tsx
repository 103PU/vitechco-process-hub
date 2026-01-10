import { prisma } from "@/lib/prisma/client";
import { DocumentFormLoader } from "@/features/documents/components/DocumentFormLoader";

async function getFormData() {
    const documentTypes = await prisma.documentType.findMany();
    const tags = await prisma.tag.findMany();
    const departments = await prisma.department.findMany();
    const machineModels = await prisma.machineModel.findMany();
    return { documentTypes, tags, departments, machineModels };
}

export default async function NewDocumentPage() {
    const { documentTypes, tags, departments, machineModels } = await getFormData();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Tạo mới Quy trình</h1>
                <p className="mt-1 text-gray-600">
                    Điền các thông tin dưới đây để thêm một quy trình mới vào hệ thống.
                </p>
            </div>
            <DocumentFormLoader 
                documentTypes={documentTypes}
                allTags={tags}
                allDepartments={departments}
                allMachineModels={machineModels}
            />
        </div>
    )
}