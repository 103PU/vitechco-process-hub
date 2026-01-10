'use client';

import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import { useState, useEffect } from 'react';

interface SearchParams {
    q?: string;
    tag?: string; // Legacy single tag support
    tags?: string[]; // New multiple tags support
    brandId?: string;
    modelId?: string; // Machine model filter
    departmentId?: string; // Department filter
    skip?: number;
    take?: number;
}

interface SearchResult {
    documents: any[];
    totalCount: number;
    skip: number;
    take: number;
    hasMore: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSearch(initialParams: SearchParams = {}) {
    const [params, setParams] = useState<SearchParams>(initialParams);
    const [debouncedQuery] = useDebounce(params.q || '', 300);

    // Build the URL with query parameters
    const buildUrl = () => {
        const searchParams = new URLSearchParams();

        if (debouncedQuery) searchParams.set('q', debouncedQuery);

        // Legacy single tag support
        if (params.tag) searchParams.set('tag', params.tag);

        // New multiple tags support
        if (params.tags && params.tags.length > 0) {
            params.tags.forEach(tag => searchParams.append('tags', tag));
        }

        if (params.brandId) searchParams.set('brandId', params.brandId);
        if (params.modelId) searchParams.set('modelId', params.modelId);
        if (params.departmentId) searchParams.set('departmentId', params.departmentId);
        if (params.skip !== undefined) searchParams.set('skip', params.skip.toString());
        if (params.take !== undefined) searchParams.set('take', params.take.toString());

        return `/api/search?${searchParams.toString()}`;
    };

    const url = buildUrl();

    // Only fetch if there are search parameters
    const shouldFetch = debouncedQuery || params.tag || params.tags || params.brandId || params.modelId || params.departmentId;

    const { data, error, isLoading, mutate } = useSWR<SearchResult>(
        shouldFetch ? url : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
        }
    );

    const updateParams = (newParams: Partial<SearchParams>) => {
        setParams((prev) => ({ ...prev, ...newParams }));
    };

    const resetSearch = () => {
        setParams({});
    };

    return {
        data,
        isLoading: shouldFetch ? isLoading : false,
        error,
        params,
        debouncedQuery,
        updateParams,
        resetSearch,
        refetch: mutate,
    };
}
