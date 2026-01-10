'use client';

import React from 'react';
import { Building, Globe } from 'lucide-react';

interface Department {
    id: string;
    name: string;
}

interface DepartmentTabsProps {
    departments: Department[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}

export function DepartmentTabs({ departments, selectedId, onSelect }: DepartmentTabsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b no-scrollbar">
            <button
                onClick={() => onSelect(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    selectedId === null
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
                <Globe size={16} />
                Tất cả bộ phận
            </button>
            {departments.map((dept) => (
                <button
                    key={dept.id}
                    onClick={() => onSelect(dept.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                        selectedId === dept.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <Building size={16} />
                    {dept.name}
                </button>
            ))}
        </div>
    );
}
