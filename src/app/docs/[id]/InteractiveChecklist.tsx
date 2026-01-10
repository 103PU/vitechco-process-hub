'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface Step {
    id: string;
    description: string;
    order: number;
}

interface InteractiveChecklistProps {
    steps: Step[];
}

export function InteractiveChecklist({ steps }: InteractiveChecklistProps) {
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

    const toggleStep = (stepId: string) => {
        const newCompleted = new Set(completedSteps);
        if (newCompleted.has(stepId)) {
            newCompleted.delete(stepId);
        } else {
            newCompleted.add(stepId);
        }
        setCompletedSteps(newCompleted);
    };

    const progress = Math.round((completedSteps.size / steps.length) * 100);

    return (
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-600" />
                    Các bước thực hiện
                </h2>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-blue-600">{progress}% hoàn thành</span>
                    <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    return (
                        <div 
                            key={step.id} 
                            onClick={() => toggleStep(step.id)}
                            className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                                isCompleted 
                                ? 'bg-green-50 border-green-100 shadow-none' 
                                : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border ${
                                    isCompleted 
                                    ? 'bg-green-500 text-white border-green-500' 
                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {isCompleted ? <CheckCircle2 size={18} /> : index + 1}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className={`text-base font-medium leading-relaxed transition-colors ${
                                    isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
                                }`}>
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
