import { Layers, Box, FileText } from 'lucide-react';
import { CategoryGroup, FullDocument } from '../../utils/doc-grouping';


interface HomeCategorySectionProps {
    group: CategoryGroup;
}

export function HomeCategorySection({ group }: HomeCategorySectionProps) {
    const categoryName = group.category?.name || 'Chưa phân loại';

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
            {/* Category Header (Level 2) - Premium Look */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100 flex items-center gap-4">
                <div className="bg-indigo-600 shadow-indigo-200 shadow-lg p-3 rounded-2xl text-white">
                    <Layers size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                        {categoryName}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">
                        {group.topicGroups.reduce((acc, g) => acc + g.docs.length, 0)} tài liệu
                    </p>
                </div>
            </div>

            <div className="p-8 space-y-10">
                {group.topicGroups.map((topicGroup, idx) => (
                    <TopicRow
                        key={topicGroup.topic?.id || `no-topic-${idx}`}
                        topicGroup={topicGroup}
                    />
                ))}
            </div>
        </div>
    );
}

function TopicRow({ topicGroup }: { topicGroup: { topic: { id: string, name: string } | null, docs: FullDocument[] } }) {
    const topicName = topicGroup.topic?.name || 'Chung';

    return (
        <div className="group/topic">
            {/* Topic Header (Level 3) */}
            <div className="flex items-center gap-3 mb-5 pl-2 border-l-4 border-transparent group-hover/topic:border-indigo-500 transition-all">
                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <Box size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                    {topicName}
                </h3>
            </div>

            {/* Document Grid - Clean & Aligned */}
            {/* Document Grid - Clean & Aligned - Wrapped in @container for component-level queries */}
            <div className="@container">
                <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4 gap-5">
                    {topicGroup.docs.map(doc => (
                        <DocumentCard key={doc.id} doc={doc} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function DocumentCard({ doc }: { doc: FullDocument }) {
    return (
        <a
            href={`/documents/${doc.id}`}
            className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="bg-slate-50 p-2.5 rounded-xl text-slate-500 group-hover:text-white group-hover:bg-indigo-600 transition-colors duration-300">
                    <FileText size={20} />
                </div>

                {/* Brand/Model Badge (Level 4) - Fixed Height Wrapper */}
                {doc.machineModels.length > 0 && (
                    <div className="flex flex-col items-end gap-1">
                        {doc.machineModels[0].machineModel.brand && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                                {doc.machineModels[0].machineModel.brand.name}
                            </span>
                        )}
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {doc.machineModels[0].machineModel.name}
                        </span>
                    </div>
                )}
            </div>

            <h4 className="font-semibold text-gray-700 leading-snug line-clamp-2 mb-auto group-hover:text-indigo-700 transition-colors">
                {doc.title}
            </h4>

            {/* Footer with Date or Tags */}
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">
                    {new Date(doc.updatedAt).toLocaleDateString('vi-VN')}
                </span>

                {doc.tags.length > 0 && (
                    <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        +{doc.tags.length} tags
                    </span>
                )}
            </div>
        </a>
    )
}
