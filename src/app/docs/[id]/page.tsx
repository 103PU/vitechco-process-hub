import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import {
    ChevronLeft,
    Calendar,
    Tag as TagIcon,
    Building,
    Cpu,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getTagColors } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { InteractiveChecklist } from "./InteractiveChecklist";

// Minimal FileText icon since it's not imported correctly from lucide-react in current scope
// We alias the import to avoid conflict
import { FileText as FileTextOriginal } from "lucide-react";
function FileText({ size, className }: { size: number, className: string }) {
    return <FileTextOriginal size={size} className={className} />
}

interface DocumentPageProps {
    params: Promise<{
        id: string;
    }>
}

async function getDocument(id: string) {
    try {
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

        // Map for UI
        return {
            ...doc,
            documentType: doc.technicalMetadata?.documentType ?? null,
            topic: doc.technicalMetadata?.topic ?? null,
            tags: doc.technicalMetadata?.tags ?? [],
            machineModels: doc.technicalMetadata?.machineModels ?? [],
            steps: doc.technicalMetadata?.steps ?? [],
            technicalMetadata: undefined
        };

    } catch (error) {
        console.error("Error fetching document:", error);
        return null;
    }
}

export default async function DocumentDetailPage({ params }: DocumentPageProps) {
    const { id } = await params;
    const doc = await getDocument(id);

    if (!doc) {
        notFound();
    }
    // ... rest of the component

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header / Navigation */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        <ChevronLeft size={20} />
                        <span>Quay lại</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>Cập nhật: {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Title and Badge Section */}
                <div className="space-y-4 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {doc.documentType && (
                            <Badge
                                variant="outline"
                                style={{
                                    backgroundColor: getTagColors(doc.documentType.name).bg,
                                    color: getTagColors(doc.documentType.name).text,
                                    borderColor: getTagColors(doc.documentType.name).border
                                }}
                            >
                                {doc.documentType.name}
                            </Badge>
                        )}
                        {doc.departments.map(({ department }: { department: { id: string; name: string } }) => (
                            <Badge key={department.id} className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                <Building size={12} className="mr-1" />
                                {department.name}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        {doc.title}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                <FileText size={20} className="text-blue-600" />
                                Nội dung chi tiết
                            </h2>
                            {/* Render HTML Content safely with Enhanced Styles */}
                            <div
                                className="prose prose-blue prose-lg max-w-none 
                                prose-headings:font-bold prose-headings:text-gray-900 
                                prose-p:text-gray-700 prose-p:leading-relaxed 
                                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-xl prose-img:shadow-md prose-img:my-6
                                prose-table:border prose-table:border-gray-200 prose-table:w-full prose-table:my-6
                                prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:text-gray-700
                                prose-td:p-3 prose-td:border-t prose-td:border-gray-100
                                prose-li:text-gray-700"
                                dangerouslySetInnerHTML={{ __html: doc.content }}
                            />
                        </section>

                        {/* Interactive Steps Section */}
                        {doc.steps.length > 0 && (
                            <InteractiveChecklist steps={doc.steps} />
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <aside className="space-y-6">
                        {/* Machine Models */}
                        {doc.machineModels.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Cpu size={16} /> Thiết bị áp dụng
                                </h3>
                                <div className="space-y-2">
                                    {doc.machineModels.map(({ machineModel }: { machineModel: { id: string; name: string; brand: { name?: string } | null } }) => (
                                        <div key={machineModel.id} className="text-gray-800 font-semibold p-2 bg-gray-50 rounded-lg border text-sm">
                                            {machineModel.brand?.name} {machineModel.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {doc.tags.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <TagIcon size={16} /> Thẻ (Tags)
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {doc.tags.map(({ tag }: { tag: { id: string; name: string } }) => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            className="font-normal"
                                            style={{
                                                backgroundColor: getTagColors(tag.name).bg,
                                                color: getTagColors(tag.name).text,
                                                borderColor: getTagColors(tag.name).border
                                            }}
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </main>
        </div>
    );
}