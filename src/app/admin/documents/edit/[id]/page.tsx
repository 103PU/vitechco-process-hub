import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import { DocumentFormLoader } from "@/features/documents/components/DocumentFormLoader";
import { StepManagerLoader } from "@/features/documents/components/StepManagerLoader";
import { DocumentService } from "@/features/documents/services/DocumentService";

interface EditDocumentPageProps {
    params: Promise<{
        id: string;
    }>
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
    const { id } = await params;
    const document = await DocumentService.getById(id);

    if (!document) {
        notFound();
    }

    const documentTypes = await prisma.documentType.findMany();
    const allTags = await prisma.tag.findMany();
    const allDepartments = await prisma.department.findMany();
    const allMachineModels = await prisma.machineModel.findMany();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Chỉnh sửa Quy trình</h1>
                <p className="mt-1 text-gray-600">
                    Cập nhật thông tin cho quy trình "{document.title}".
                </p>
            </div>
            <DocumentFormLoader 
                documentTypes={documentTypes}
                allTags={allTags}
                allDepartments={allDepartments}
                allMachineModels={allMachineModels}
                initialData={document}
            />
            <StepManagerLoader documentId={document.id} initialSteps={document.steps} />
        </div>
    )
}