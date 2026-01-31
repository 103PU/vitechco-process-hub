import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import {
    ChevronLeft,
    Tag as TagIcon,
    Building,
    Cpu,
    Clock
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getTagColors } from "@/lib/utils";
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
        <div className="bg-[#FAFAFA] min-h-screen pb-20 font-sans">
            {/* Header / Navigation */}
            <header className="bg-white border-b sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 font-medium hover:text-blue-600 transition-colors group">
                        <div className="bg-gray-100 p-1.5 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <ChevronLeft size={18} />
                        </div>
                        <span>Quay lại</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <Clock size={14} className="text-gray-400" />
                        <span className="font-medium">Cập nhật: {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Title and Badge Section */}
                <div className="max-w-5xl mx-auto mb-10 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                        {doc.documentType && (
                            <Badge
                                variant="outline"
                                className="px-3 py-1 text-sm font-medium border-0 shadow-sm"
                                style={{
                                    backgroundColor: getTagColors(doc.documentType.name).bg,
                                    color: getTagColors(doc.documentType.name).text,
                                    boxShadow: `0 0 0 1px ${getTagColors(doc.documentType.name).border} inset`
                                }}
                            >
                                {doc.documentType.name}
                            </Badge>
                        )}
                        {doc.departments.map(({ department }: { department: { id: string; name: string } }) => (
                            <Badge key={department.id} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-sm shadow-sm hover:bg-indigo-100 transition-colors">
                                <Building size={14} className="mr-1.5" />
                                {department.name}
                            </Badge>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
                        {doc.title}
                    </h1>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 mx-auto max-w-7xl">
                    {/* Main Content */}
                    <article className="min-w-0">
                        {/* Content Card */}
                        <section className="bg-white p-8 md:p-12 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
                            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-gray-100">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Nội dung chi tiết
                                </h2>
                            </div>

                            {/* Render HTML Content with Enhanced Typography (Notion-like) */}
                            <div
                                className="prose prose-slate prose-lg max-w-none 
                                prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                                prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                                prose-p:text-gray-700 prose-p:leading-8 prose-p:my-6
                                prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:border prose-img:border-gray-100
                                prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-gray-200 prose-table:shadow-sm prose-table:rounded-lg prose-table:overflow-hidden prose-table:my-8
                                prose-th:bg-gray-50 prose-th:p-4 prose-th:text-left prose-th:text-xs prose-th:font-bold prose-th:uppercase prose-th:text-gray-500 prose-th:tracking-wider prose-th:border-b prose-th:border-gray-200
                                prose-td:p-4 prose-td:border-b prose-td:border-gray-100 prose-td:text-sm prose-td:text-gray-600 prose-td:align-top
                                prose-li:text-gray-700 prose-li:my-2
                                prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                                prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-blue-900
                                prose-code:bg-gray-100 prose-code:text-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none"
                                dangerouslySetInnerHTML={{ __html: doc.content }}
                            />
                        </section>

                        {/* Interactive Steps Section (if any) */}
                        {doc.steps.length > 0 && (
                            <div className="mt-8">
                                <InteractiveChecklist steps={doc.steps} />
                            </div>
                        )}
                    </article>

                    {/* Sidebar Info - Sticky */}
                    <aside className="space-y-6 xl:sticky xl:top-24 h-fit">
                        {/* Machine Models Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-shadow hover:shadow-md">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Cpu size={14} /> Thiết bị áp dụng
                            </h3>
                            {doc.machineModels.length > 0 ? (
                                <div className="space-y-2">
                                    {doc.machineModels.map(({ machineModel }: { machineModel: { id: string; name: string; brand: { name?: string } | null } }) => (
                                        <div key={machineModel.id} className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                                            <span className="font-semibold text-gray-700 text-sm">{machineModel.name}</span>
                                            {machineModel.brand?.name && (
                                                <Badge variant="secondary" className="text-[10px] h-5 bg-white border border-gray-200 text-gray-500">
                                                    {machineModel.brand.name}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Áp dụng cho tất cả thiết bị</p>
                            )}
                        </div>

                        {/* Tags Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 transition-shadow hover:shadow-md">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <TagIcon size={14} /> Thẻ (Tags)
                            </h3>
                            {doc.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {doc.tags.map(({ tag }: { tag: { id: string; name: string } }) => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            className="font-medium px-2.5 py-1 text-xs transition-transform hover:scale-105"
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
                            ) : (
                                <p className="text-sm text-gray-400 italic">Không có thẻ tag</p>
                            )}
                        </div>

                        {/* More Info / Meta */}
                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 text-sm text-blue-800">
                            <p className="font-semibold mb-1">Thông tin quản lý</p>
                            <div className="flex justify-between py-1 border-b border-blue-200/50">
                                <span className="text-blue-600">ID:</span>
                                <span className="font-mono text-xs">{doc.id.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-blue-600">Topic:</span>
                                <span>{doc.topic?.name || 'N/A'}</span>
                            </div>
                        </div>

                    </aside>
                </div>
            </main>
        </div>
    );
}