import { useState, Fragment } from 'react';
import { ChevronRight, ChevronUp, LayoutGrid, Minimize2 } from 'lucide-react';
import { TypeGroup } from '../../utils/doc-grouping';
import { HomeTagCompact, HomeTagExpanded } from './HomeTagSection';
import { getDocumentTypeIcon } from '../../utils/ui-helpers';
import { useGridColumns } from '@/hooks/use-grid-columns';
import { cn } from '@/lib/utils';

interface HomeTypeSectionProps {
    group: TypeGroup;
}

export function HomeTypeSection({ group }: HomeTypeSectionProps) {
    const [expandedTagId, setExpandedTagId] = useState<string | null>(null);
    const [isSectionExpanded, setIsSectionExpanded] = useState(false);
    const columns = useGridColumns();

    const typeName = group.type?.name || 'Chưa phân loại';
    const Icon = getDocumentTypeIcon(group.type?.name);
    const totalTags = group.tagGroups.length;

    // Compact View Limit: Show 1 row based on column count
    const limit = columns;
    const visibleTags = isSectionExpanded ? group.tagGroups : group.tagGroups.slice(0, limit);

    // Find the currently expanded group object and its index
    const expandedIndex = visibleTags.findIndex(g => (g.tag?.id || 'null') === expandedTagId);
    const expandedGroup = expandedIndex !== -1 ? visibleTags[expandedIndex] : null;

    // Calculate where the expanded panel should be inserted
    // It should be after the last item of the row containing the clicked item
    const insertAfterIndex = expandedIndex !== -1
        ? Math.ceil((expandedIndex + 1) / columns) * columns - 1
        : -1;

    const handleToggleTag = (id: string) => {
        setExpandedTagId(prev => prev === id ? null : id);
    };

    const toggleSection = () => {
        setIsSectionExpanded(prev => !prev);
        // Reset expanded tag detail when collapsing section to avoid layout glitches
        if (isSectionExpanded) setExpandedTagId(null);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8 last:mb-0 transition-all duration-500 ease-in-out">
            {/* Type Header */}
            <div className="bg-gradient-to-r from-gray-50 via-white to-white px-6 py-5 border-b border-gray-100 flex justify-between items-center group/header">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-2.5 rounded-xl shadow-md transition-all duration-300",
                        "bg-blue-600 shadow-blue-200 group-hover/header:scale-110 group-hover/header:rotate-3"
                    )}>
                        <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-800 tracking-tight uppercase">
                        {typeName}
                    </h2>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                        {totalTags}
                    </span>
                </div>

                {totalTags > limit && (
                    <button
                        onClick={toggleSection}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border",
                            isSectionExpanded
                                ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:shadow-red-200"
                                : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-blue-200",
                            "shadow-sm hover:shadow-md active:scale-95"
                        )}
                    >
                        {isSectionExpanded ? (
                            <>
                                <Minimize2 size={16} strokeWidth={2.5} />
                                Thu gọn
                            </>
                        ) : (
                            <>
                                <LayoutGrid size={16} strokeWidth={2.5} />
                                Xem tất cả
                                <ChevronRight size={16} strokeWidth={3} className="ml-1" />
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Content Area - Grid of Tags */}
            <div className="p-6 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {visibleTags.map((tagGroup, idx) => {
                    const tagId = tagGroup.tag?.id || 'null';
                    const isExpanded = expandedTagId === tagId;

                    // Render Expanded View logic
                    const shouldRenderExpanded = expandedGroup && (
                        idx === insertAfterIndex ||
                        (idx === visibleTags.length - 1 && insertAfterIndex >= visibleTags.length)
                    );

                    return (
                        <Fragment key={`group-${tagId}-${idx}`}>
                            <HomeTagCompact
                                key={`compact-${tagId}-${idx}`}
                                group={tagGroup}
                                isActive={isExpanded}
                                onClick={() => handleToggleTag(tagId)}
                            />
                            {shouldRenderExpanded && (
                                <HomeTagExpanded
                                    key={`expanded-${expandedTagId}`}
                                    group={expandedGroup}
                                    onClose={() => setExpandedTagId(null)}
                                />
                            )}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}
