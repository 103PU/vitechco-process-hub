'use client'

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateSteps } from '../actions';
import { toast } from 'sonner';

type LocalStep = { id?: string; description: string; order: number; localId: string };

interface StepManagerProps {
    documentId: string;
    initialSteps: { id: string; description: string; order: number }[];
}

interface SortableStepItemProps {
    step: { id?: string, description: string, order: number, localId: string };
    index: number;
    onDescriptionChange: (id: string, value: string) => void;
    onDelete: (id: string) => void;
}

function SortableStepItem({ step, index, onDescriptionChange, onDelete }: SortableStepItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.localId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1, // Bring to front when dragging
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`flex items-start gap-3 p-3 rounded-lg border bg-white transition-shadow ${isDragging ? 'shadow-lg border-blue-400' : 'shadow-sm border-gray-200'}`}
        >
            <span {...attributes} {...listeners} className="cursor-grab p-1 mt-1 hover:bg-gray-100 rounded">
                <GripVertical size={20} className="text-gray-400" />
            </span>
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shrink-0 mt-0.5">
                {index + 1}
            </div>

            <div className="flex-1">
                <Input
                    value={step.description}
                    onChange={(e) => onDescriptionChange(step.localId, e.target.value)}
                    className="flex-1 border-0 focus-visible:ring-0 px-0 h-auto py-1 font-medium text-gray-700 placeholder:text-gray-400 bg-transparent"
                    placeholder={`Mô tả cho bước ${index + 1}...`}
                />
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => onDelete(step.localId)} className="text-gray-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 size={18} />
            </Button>
        </div>
    );
}

export function StepManager({ documentId, initialSteps }: StepManagerProps) {
    const [steps, setSteps] = useState<LocalStep[]>(() =>
        (initialSteps || []).map((s) => ({ ...s, localId: s.id }))
    );
    const [newStep, setNewStep] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleAddStep = () => {
        if (!newStep.trim()) return;
        const next: LocalStep = {
            id: `new-${Date.now()}`,
            localId: `new-${Date.now()}`,
            description: newStep.trim(),
            order: steps.length + 1,
        };
        setSteps((prev) => [...prev, next]);
        setNewStep('');
    };

    const handleDelete = (localId: string) => {
        setSteps((prev) => prev.filter((s) => s.localId !== localId));
    };

    const handleDescriptionChange = (localId: string, value: string) => {
        setSteps((prev) => prev.map((s) => (s.localId === localId ? { ...s, description: value } : s)));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setSteps((prev) => {
            const oldIndex = prev.findIndex((s) => s.localId === active.id);
            const newIndex = prev.findIndex((s) => s.localId === over.id);
            const reordered = arrayMove(prev, oldIndex, newIndex).map((s, idx) => ({ ...s, order: idx + 1 }));
            return reordered;
        });
    };

    const handleSaveChanges = async () => {
        try {
            setIsSaving(true);
            const payload = steps.map((s, idx) => ({
                id: s.id,
                description: s.description,
                order: idx + 1,
            }));
            const res = await updateSteps(documentId, payload);
            if (res.success) {
                toast.success('Đã lưu các bước.');
            } else {
                toast.error(res.error || 'Không thể lưu các bước.');
            }
        } catch (e) {
            toast.error('Đã có lỗi khi lưu.');
        } finally {
            setIsSaving(false);
        }
    };

    // Update the mapping to pass index
    return (
        <div className="space-y-6 pt-8 mt-8 border-t border-gray-200">
             <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Quy trình thực hiện</h2>
                    <p className="text-sm text-gray-500">Định nghĩa các bước cần làm theo thứ tự.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>
             </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map(s => s.localId)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <SortableStepItem 
                                key={step.localId} 
                                step={step as any} 
                                index={index}
                                onDescriptionChange={handleDescriptionChange}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {steps.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-400">
                    Chưa có bước nào được tạo.
                </div>
            )}

            <div className="flex gap-2 mt-4">
                <Input
                    placeholder="Nhập nội dung bước mới và nhấn Enter..."
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddStep()}}
                    className="shadow-sm"
                />
                <Button onClick={handleAddStep}>Thêm bước</Button>
            </div>
        </div>
    );
}