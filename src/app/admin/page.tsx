import { prisma } from "@/lib/prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/auth/config/authOptions";
import {
    FileText,
    Users,
    CheckCircle2,
    Clock,
    TrendingUp,
    Plus,
    Tags
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChartsWrapper } from "./_components/ChartsWrapper";

type LatestDoc = {
    id: string;
    title: string;
    updatedAt: Date;
    documentType: { name: string } | null;
};

type Stats = {
    docCount: number;
    userCount: number;
    tagCount: number;
    latestDocs: LatestDoc[];
    completionRate: number;
    chartData: { name: string; value: number }[];
};

async function getStats(): Promise<Stats> {
    const [docCount, userCount, tagCount, latestDocs, typesBreakdown] = await Promise.all([
        prisma.document.count(),
        prisma.user.count(),
        prisma.tag.count(),
        prisma.document.findMany({
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: {
                technicalMetadata: {
                    include: { documentType: true }
                }
            }
        }),
        prisma.documentType.findMany({
            include: {
                _count: {
                    select: { technicalMetadataList: true }
                }
            }
        })
    ]);

    const docsWithSteps = await prisma.document.count({
        where: {
            technicalMetadata: {
                steps: { some: {} }
            }
        }
    });

    const completionRate = docCount > 0 ? Math.round((docsWithSteps / docCount) * 100) : 0;

    return {
        docCount,
        userCount,
        tagCount,
        latestDocs: latestDocs.map((d: any) => ({
            id: d.id,
            title: d.title,
            updatedAt: d.updatedAt,
            documentType: d.technicalMetadata?.documentType ? { name: d.technicalMetadata.documentType.name } : null
        })),
        completionRate,
        chartData: typesBreakdown.map((t: any) => ({ name: t.name, value: t._count.technicalMetadataList }))
    };
}

export default async function AdminDashboardPage() {
    const stats = await getStats();

    const kpis = [
        { title: "Tổng tài liệu", value: stats.docCount, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Nhân sự", value: stats.userCount, icon: Users, color: "text-green-600", bg: "bg-green-50" },
        { title: "Thẻ (Tags)", value: stats.tagCount, icon: Tags, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Số hóa quy trình", value: `${stats.completionRate}%`, icon: CheckCircle2, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hệ thống Quản trị</h1>
                    <p className="text-gray-500 mt-1">Tổng quan tình trạng dữ liệu và hoạt động hệ thống.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/documents/new">
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm">
                            <Plus size={18} /> Soạn tài liệu mới
                        </button>
                    </Link>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                                <h3 className="text-3xl font-bold mt-1 text-gray-900">{kpi.value}</h3>
                            </div>
                            <div className={`${kpi.bg} p-3 rounded-xl`}>
                                <kpi.icon className={kpi.color} size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
                            <TrendingUp size={12} className="mr-1" /> Cập nhật tức thì
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Phân bổ dữ liệu</h2>
                        <Badge variant="outline">Theo Loại</Badge>
                    </div>
                    <div className="h-[300px] w-full">
                        <ChartsWrapper data={stats.chartData} />
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Cập nhật mới nhất</h2>
                    <div className="space-y-6">
                        {stats.latestDocs.map((doc: LatestDoc) => (
                            <div key={doc.id} className="flex gap-4 group cursor-pointer">
                                <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 transition-colors h-fit mt-1">
                                    <Clock size={18} className="text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">{doc.title}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{doc.documentType?.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase">
                                        {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link href="/admin/documents">
                        <button className="w-full mt-8 text-sm font-medium text-blue-600 hover:text-blue-700 py-2 border border-blue-100 rounded-lg hover:bg-blue-50 transition-all">
                            Xem tất cả tài liệu
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}