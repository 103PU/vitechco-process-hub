'use client';

import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';

// Utils & Components
import { FullDocument, groupDocumentsByCategoryAndTopic } from '@/features/documents/utils/grouping';
import { HomeCategorySection } from '@/features/documents/components/home/HomeCategorySection';
import { DepartmentTabs } from './DepartmentTabs';

type SimpleDepartment = {
  id: string;
  name: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[1, 2].map(i => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
            <div className="h-8 w-1/4 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-6 pl-4">
            <div className="h-6 w-1/6 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DocumentFlow() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  const apiUrl = `/api/documents?q=${encodeURIComponent(searchQuery)}`;
  const { data: documents, error, isLoading } = useSWR<FullDocument[]>(apiUrl, fetcher);

  // Extract unique departments from data for tabs
  const departments = useMemo(() => {
    if (!documents) return [];
    const deptMap = new Map<string, SimpleDepartment>();
    documents.forEach(doc => {
      doc.departments.forEach(({ department }: { department: SimpleDepartment }) => {
        deptMap.set(department.id, department);
      });
    });
    return Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [documents]);

  // Filter documents by selected department
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return selectedDeptId
      ? documents.filter(doc => doc.departments.some((d: { department: SimpleDepartment }) => d.department.id === selectedDeptId))
      : documents;
  }, [documents, selectedDeptId]);

  // Grouping logic (Category -> Topic -> Docs)
  const groupedData = useMemo(() => {
    return groupDocumentsByCategoryAndTopic(filteredDocuments);
  }, [filteredDocuments]);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !documents) return (
    <div className="text-center py-20">
      <p className="text-red-500">Đã có lỗi xảy ra khi tải dữ liệu.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Department Filter Tabs */}
      <DepartmentTabs
        departments={departments}
        selectedId={selectedDeptId}
        onSelect={setSelectedDeptId}
      />

      {/* Main Content Area */}
      {groupedData.length > 0 ? (
        <div className="space-y-10">
          {groupedData.map((catGroup, idx) => (
            <HomeCategorySection
              key={catGroup.category?.id || `cat-uncategorized-${idx}`}
              group={catGroup}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            {/* Placeholder Icon */}
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Không tìm thấy tài liệu</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm text-center">
            Không có tài liệu nào phù hợp với bộ lọc hiện tại. Hãy thử chọn bộ phận khác hoặc xóa từ khóa tìm kiếm.
          </p>
        </div>
      )}
    </div>
  );
}