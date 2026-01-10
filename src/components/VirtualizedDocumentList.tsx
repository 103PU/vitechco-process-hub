'use client';

import React from 'react';
import { List } from 'react-window';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VirtualizedDocument {
    id: string;
    title: string;
    documentType?: { name: string };
    createdAt: string;
}

interface VirtualizedDocumentListProps {
    documents: VirtualizedDocument[];
    itemHeight?: number;
    height?: number;
    className?: string;
}

/**
 * VirtualizedDocumentList
 * 
 * Uses react-window for efficient rendering of large document lists.
 * Only renders visible items in the viewport, dramatically reducing DOM nodes.
 * 
 *  Automatically activates when list > 50 items, falls back to normal render otherwise.
 * 
 * Performance benefits:
 * - Before: 200 DOM nodes for 200 items
 * - After: ~10 DOM nodes (only visible items)
 * - 95% reduction in DOM size  
 * 
 * @param documents - List of documents to display
 * @param itemHeight - Height of each item in pixels (default: 100)
 * @param height - Height of the scrollable container (default: 600)
 */
export function VirtualizedDocumentList({
    documents,
    itemHeight = 100,
    height = 600,
    className = '',
}: VirtualizedDocumentListProps) {
    // Threshold: only virtualize if >50 items
    const shouldVirtualize = documents.length > 50;

    // Row renderer for virtualized list - updated for react-window v2 API
    const Row = ({ index, style }: { index: number; style: React.CSSProperties; ariaAttributes?: any }) => {
        const doc = documents[index];

        return (
            <div style={style} className="px-2">
                <Link href={`/docs/${doc.id}`}>
                    <div className="group flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors shrink-0">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {doc.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                {doc.documentType && (
                                    <Badge variant="secondary" className="text-xs">
                                        {doc.documentType.name}
                                    </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                    {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    };

    // Non-virtualized fallback for small lists
    if (!shouldVirtualize) {
        return (
            <div className={`space-y-2 ${className}`}>
                {documents.map((doc, index) => (
                    <Row key={doc.id} index={index} style={{}} />
                ))}
            </div>
        );
    }

    // Virtualized list for large datasets using react-window v2 API
    return (
        <div className={className} style={{ height }}>
            <List<{}>
                rowComponent={Row}
                rowCount={documents.length}
                rowHeight={itemHeight}
                rowProps={{} as any}
                style={{ width: '100%' }}
                className="scrollbar-thin"
            />
        </div>
    );
}
