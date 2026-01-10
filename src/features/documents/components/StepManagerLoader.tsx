'use client';

import dynamic from 'next/dynamic';

const StepManager = dynamic(() => import('./StepManager').then(mod => mod.StepManager), { 
    ssr: false,
    loading: () => <p>Đang tải trình quản lý các bước...</p>
});

interface StepManagerLoaderProps {
    documentId: string;
    initialSteps: { id: string; description: string; order: number }[];
}

export function StepManagerLoader({ documentId, initialSteps }: StepManagerLoaderProps) {
    return (
        <StepManager
            documentId={documentId}
            initialSteps={initialSteps}
        />
    );
}
