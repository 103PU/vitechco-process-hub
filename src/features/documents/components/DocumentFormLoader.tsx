'use client';

import dynamic from 'next/dynamic';

type SimpleTag = { id: string; name: string }
type SimpleDocumentType = { id: string; name: string }
type SimpleDepartment = { id: string; name: string }
type SimpleMachineModel = { id: string; name: string }

const DocumentForm = dynamic(() => import('./DocumentForm').then(mod => mod.DocumentForm), { 
    ssr: false,
    loading: () => <p>Đang tải trình soạn thảo...</p>
});

interface DocumentFormLoaderProps {
    documentTypes: SimpleDocumentType[];
    allTags: SimpleTag[];
    allDepartments: SimpleDepartment[];
    allMachineModels: SimpleMachineModel[];
    initialData?: any;
}

export function DocumentFormLoader({ documentTypes, allTags, allDepartments, allMachineModels, initialData }: DocumentFormLoaderProps) {
    return (
        <DocumentForm
            documentTypes={documentTypes}
            allTags={allTags}
            allDepartments={allDepartments}
            allMachineModels={allMachineModels}
            initialData={initialData}
        />
    );
}
