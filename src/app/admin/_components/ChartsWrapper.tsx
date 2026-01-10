'use client';

import dynamic from 'next/dynamic';

// This is the correct place to use dynamic import with ssr: false
const OverviewCharts = dynamic(() => import('./OverviewCharts'), { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-50 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Đang tải biểu đồ...</div>
});

interface ChartsWrapperProps {
    data: { name: string, value: number }[];
}

export function ChartsWrapper({ data }: ChartsWrapperProps) {
    return <OverviewCharts data={data} />;
}
