'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Tag as TagIcon, Cpu, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Document {
    id: string;
    title: string;
    content?: string; // Optional: excluded from list views for performance
    createdAt: string;
    documentType?: { name: string };
    topic?: { name: string };
    machineModels: Array<{
        machineModel: {
            name: string;
            brand?: { name: string };
        };
    }>;
    tags: Array<{ tag: { name: string } }>;
    departments: Array<{ department: { name: string } }>;
}

interface SearchResultsGridProps {
    documents: Document[];
    isLoading: boolean;
    totalCount: number;
    hasMore: boolean;

    onLoadMore?: () => void;
    emptyMessage?: string;
}

// Memoized DocumentCard to prevent unnecessary re-renders
const DocumentCard = React.memo(({ document }: { document: Document }) => {
    // Only show excerpt if content is available (excluded in list views for performance)
    const excerpt = document.content
        ? document.content.slice(0, 200) + (document.content.length > 200 ? '...' : '')
        : 'Click to view document details...';

    return (
        <Link href={`/docs/${document.id}`}>
            <div className="group p-4 sm:p-6 border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-white h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 break-words">
                            {document.title}
                        </h3>
                        {document.documentType && (
                            <Badge variant="secondary" className="mt-1">
                                {document.documentType.name}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content Excerpt */}
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
                    {excerpt}
                </p>

                {/* Metadata */}
                <div className="space-y-2 pt-3 border-t border-gray-100">
                    {/* Machine Models & Brands */}
                    {document.machineModels.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Cpu className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <div className="flex gap-1 flex-wrap">
                                {document.machineModels.slice(0, 3).map((mm, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {mm.machineModel.brand?.name} {mm.machineModel.name}
                                    </Badge>
                                ))}
                                {document.machineModels.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{document.machineModels.length - 3}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {document.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <TagIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <div className="flex gap-1 flex-wrap">
                                {document.tags.slice(0, 3).map((t, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {t.tag.name}
                                    </Badge>
                                ))}
                                {document.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{document.tags.length - 3}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Departments */}
                    {document.departments.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <div className="flex gap-1 flex-wrap">
                                {document.departments.slice(0, 2).map((d, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {d.department.name}
                                    </Badge>
                                ))}
                                {document.departments.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{document.departments.length - 2}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});

// Add displayName for debugging
DocumentCard.displayName = 'DocumentCard';

function DocumentSkeleton() {
    return (
        <div className="p-6 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-start gap-3 mb-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </div>
            <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-100">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
            </div>
        </div>
    );
}

export function SearchResultsGrid({
    documents,
    isLoading,
    totalCount,
    hasMore,
    onLoadMore,
    emptyMessage = 'Không tìm thấy kết quả nào.',
}: SearchResultsGridProps) {
    // Show loading skeletons
    if (isLoading && documents.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <DocumentSkeleton key={idx} />
                ))}
            </div>
        );
    }

    // Show empty state
    if (!isLoading && documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không tìm thấy tài liệu
                </h3>
                <p className="text-gray-600 text-center max-w-md">
                    {emptyMessage}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
            {/* Results count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Tìm thấy <span className="font-semibold text-gray-900">{totalCount}</span> kết quả
                </p>
            </div>

            {/* Grid - mobile-first: single column on small screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {documents.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && onLoadMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        onClick={onLoadMore}
                        disabled={isLoading}
                        variant="outline"
                        className="min-w-[200px]"
                    >
                        {isLoading ? 'Đang tải...' : 'Xem thêm'}
                    </Button>
                </div>
            )}
        </div>
    );
}
