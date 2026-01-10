import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  /** Icon to display */
  icon: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState Component
 * 
 * Displays a friendly empty state with icon, message, and optional action.
 * Use when lists/grids have no data to show.
 * 
 * @example
 * <EmptyState
 *   icon={FileText}
 *   title="No documents found"
 *   description="Try adjusting your search filters"
 *   action={{ label: 'Clear filters', onClick: handleClear }}
 * />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="mb-4 p-4 rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon 
          className="h-12 w-12 text-gray-400 dark:text-gray-500" 
          aria-hidden="true"
        />
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>
      
      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="min-w-[140px]"
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="min-w-[140px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Preset empty states for common scenarios
 */

import { FileText, Search, FolderOpen, CheckSquare, AlertCircle } from 'lucide-react';

export const EmptyStates = {
  NoDocuments: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={FileText}
      title="Chưa có tài liệu"
      description="Bắt đầu bằng cách tạo tài liệu mới hoặc import từ file"
      {...props}
    />
  ),
  
  NoSearchResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Search}
      title="Không tìm thấy kết quả"
      description="Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm"
      {...props}
    />
  ),
  
  NoChecklists: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={CheckSquare}
      title="Chưa có checklist"
      description="Tạo checklist đầu tiên để theo dõi tiến độ công việc"
      {...props}
    />
  ),
  
  NoCategories: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={FolderOpen}
      title="Chưa có danh mục"
      description="Thêm danh mục để tổ chức tài liệu tốt hơn"
      {...props}
    />
  ),
  
  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={AlertCircle}
      title="Có lỗi xảy ra"
      description="Không thể tải dữ liệu. Vui lòng thử lại sau."
      {...props}
    />
  )
};
