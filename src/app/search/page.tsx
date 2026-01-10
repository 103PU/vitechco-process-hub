'use client';

import { useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { SearchInput } from '@/components/SearchInput';
import { SearchResultsGrid } from '@/components/SearchResultsGrid';

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const { data, isLoading, updateParams, debouncedQuery } = useSearch({
        take: 20,
    });

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        updateParams({ q: value, skip: 0 });
    };

    const handleClear = () => {
        setSearchQuery('');
        updateParams({ q: '', skip: 0 });
    };

    const handleLoadMore = () => {
        if (data) {
            updateParams({ skip: data.skip + data.take });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tìm kiếm tài liệu
                    </h1>
                    <p className="text-gray-600">
                        Tìm kiếm quy trình, hướng dẫn, và tài liệu kỹ thuật
                    </p>
                </div>

                {/* Search Input */}
                <div className="mb-8">
                    <SearchInput
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onClear={handleClear}
                        isLoading={isLoading && debouncedQuery !== searchQuery}
                        className="max-w-2xl mx-auto"
                    />
                </div>

                {/* Results */}
                <SearchResultsGrid
                    documents={data?.documents || []}
                    isLoading={isLoading}
                    totalCount={data?.totalCount || 0}
                    hasMore={data?.hasMore || false}
                    onLoadMore={handleLoadMore}
                    emptyMessage={
                        searchQuery
                            ? `Không tìm thấy kết quả cho "${debouncedQuery}"`
                            : 'Nhập từ khóa để tìm kiếm tài liệu'
                    }
                />
            </div>
        </div>
    );
}
