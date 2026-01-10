'use client';

import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from './textarea';
import { GripVertical, Trash2, Plus } from 'lucide-react';

export type CheckListStep = {
    id: string;
    description: string;
};

interface ChecklistEditorProps {
    initialSteps?: CheckListStep[];
    onChange?: (steps: CheckListStep[]) => void;
}

function SortableItem({ id, description, onRemove, onUpdate }: {
    id: string,
    description: string,
    onRemove: () => void,
    onUpdate: (val: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2 bg-white p-3 border rounded-md mb-2 shadow-sm">
            <button {...attributes} {...listeners} className="mt-2 cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
            </button>
            <div className="flex-1">
                <Textarea
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate(e.target.value)}
                    placeholder="Mô tả bước thực hiện..."
                    className="min-h-[60px]"
                />
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 size={18} />
            </Button>
        </div>
    );
}

export function ChecklistEditor({ initialSteps = [], onChange }: ChecklistEditorProps) {
    const [steps, setSteps] = useState<CheckListStep[]>(initialSteps);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSteps((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                onChange?.(newItems);
                return newItems;
            });
        }
    };

    const addStep = () => {
        const newStep = { id: `step-${Date.now()}`, description: '' };
        const newSteps = [...steps, newStep];
        setSteps(newSteps);
        onChange?.(newSteps);
    };

    const removeStep = (id: string) => {
        const newSteps = steps.filter(s => s.id !== id);
        setSteps(newSteps);
        onChange?.(newSteps);
    };

    const updateStep = (id: string, description: string) => {
        const newSteps = steps.map(s => s.id === id ? { ...s, description } : s);
        setSteps(newSteps);
        onChange?.(newSteps);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Danh sách các bước (Checklist)</h3>
                <Button onClick={addStep} size="sm" variant="outline" className="gap-2">
                    <Plus size={16} /> Thêm bước
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={steps}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                        {steps.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">Chưa có bước nào. Nhấn "Thêm bước" để bắt đầu.</p>
                        )}
                        {steps.map(step => (
                            <SortableItem
                                key={step.id}
                                id={step.id}
                                description={step.description}
                                onRemove={() => removeStep(step.id)}
                                onUpdate={(val) => updateStep(step.id, val)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
