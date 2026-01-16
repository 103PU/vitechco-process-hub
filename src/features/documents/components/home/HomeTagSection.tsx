import { useEffect, useRef } from 'react';
import type { TagGroup } from '../../utils/doc-grouping';
import { HomeDocumentCard } from './HomeDocumentCard';
import { getTagColorStyles, getTagIcon } from '../../utils/ui-helpers';
import { cn } from '@/lib/utils';
import { X, Maximize2 } from 'lucide-react';

interface HomeTagProps {
    group: TagGroup;
}

interface HomeTagCompactProps extends HomeTagProps {
    onClick: () => void;
    isActive: boolean;
}

interface HomeTagExpandedProps extends HomeTagProps {
    onClose: () => void;
}

// --- COMPACT VIEW (Square Card) ---
export function HomeTagCompact({ group, onClick, isActive }: HomeTagCompactProps) {
    const tagName = group.tag?.name || 'Chung';
    const styles = getTagColorStyles(group.tag?.name);
    const Icon = getTagIcon(group.tag?.name);
    const docCount = group.docs.length;

    return (
        <div
            onClick={onClick}
            className={cn(
                "aspect-[4/3] sm:aspect-square flex flex-col items-center justify-center p-6 text-center cursor-pointer",
                "bg-white rounded-2xl border-2 transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden",
                isActive ? "ring-2 ring-offset-2 ring-blue-500 scale-105 shadow-md" : "",
                styles.border, // Border color matches tag
                styles.lightBg // Light background
            )}
        >
            {isActive && (
                <div className={cn("absolute inset-0 opacity-10 pointer-events-none", styles.bg)} />
            )}

            <div className={cn(
                "p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110",
                "bg-white shadow-sm border",
                styles.border, styles.text
            )}>
                <Icon size={32} strokeWidth={2} />
            </div>

            <h3 className={cn("text-lg font-extrabold uppercase tracking-tight mb-1", styles.text)}>
                {tagName}
            </h3>

            <span className="text-sm font-semibold text-gray-500">
                {docCount} tài liệu
            </span>

            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-gray-400 flex items-center gap-1">
                <Maximize2 size={12} />
                {isActive ? 'Đang xem' : 'Nhấn để xem'}
            </div>
        </div>
    );
}

// --- EXPANDED VIEW (Full Width List) ---
export function HomeTagExpanded({ group, onClose }: HomeTagExpandedProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const tagName = group.tag?.name || 'Chung';
    const styles = getTagColorStyles(group.tag?.name);
    const Icon = getTagIcon(group.tag?.name);

    // Auto-scroll when mounted if content overflows viewport
    useEffect(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            // If the bottom of the element is significantly below the viewport, scroll it into view
            if (rect.bottom > viewportHeight) {
                containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            } else {
                // Optional: Scroll slightly to make sure the top tab is visible if it was clicked at the bottom of screen
                containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, []);

    return (
        <div
            ref={containerRef}
            className="col-span-1 sm:col-span-2 lg:col-span-4 animate-in fade-in zoom-in-95 duration-300 w-full mb-6"
        >
            <div className="relative flex flex-col mt-4"> {/* Added margin top for tabs space */}

                {/* Header Tabs Row (Title Left - Close Right) */}
                <div className="flex justify-between items-end px-4 w-full relative z-[2] -mb-[2px]">
                    {/* Title Tab */}
                    <div className={cn(
                        "inline-flex items-center gap-2 px-6 py-2.5",
                        "border-t-2 border-l-2 border-r-2 rounded-t-2xl",
                        "bg-white",
                        styles.border,
                        styles.text
                    )}>
                        <Icon size={20} strokeWidth={2.5} />
                        <span className="text-base font-bold uppercase tracking-wider">
                            {tagName}
                        </span>
                    </div>

                    {/* Close Button Tab (Trồi lên) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className={cn(
                            "group inline-flex items-center justify-center p-2.5",
                            "border-t-2 border-l-2 border-r-2 rounded-t-xl",
                            "bg-white text-gray-400 cursor-pointer",
                            "hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200",
                            styles.border
                        )}
                        title="Thu gọn"
                    >
                        <X size={22} strokeWidth={2.5} className="transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Content Container */}
                <div className={cn(
                    "border-2 p-6 rounded-b-2xl rounded-tl-none rounded-tr-none", // Straight top corners to merge with tabs
                    "relative z-[1] bg-white shadow-sm w-full",
                    styles.border
                )}>
                    {/* Documents Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {group.docs.map(doc => (
                            <HomeDocumentCard key={doc.id} doc={doc} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
