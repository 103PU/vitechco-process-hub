"use client"

import * as React from "react"
import { Check, PlusCircle, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getAllDepartments, updateDocumentDepartments, createDepartment } from "../../actions"
import { toast } from "sonner"

type Dept = { id: string, name: string };

interface ManageDepartmentsDialogProps {
    documentIds: string[];
    initialDepartments: Dept[];
    children: React.ReactNode;
}

export function ManageDepartmentsDialog({ documentIds, initialDepartments, children }: ManageDepartmentsDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [allDepartments, setAllDepartments] = React.useState<Dept[]>([])
    const [selectedDepts, setSelectedDepts] = React.useState<Dept[]>(initialDepartments)
    const [inputValue, setInputValue] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (open) {
            getAllDepartments().then(result => {
                if (result.success) {
                    setAllDepartments(result.departments)
                }
            })
            setSelectedDepts(initialDepartments);
        }
    }, [open, initialDepartments])

    const handleSelect = (dept: Dept) => {
        setSelectedDepts(prev => [...prev, dept])
        setInputValue("")
    }

    const handleRemove = (id: string) => {
        setSelectedDepts(prev => prev.filter(d => d.id !== id))
    }

    const handleCreate = async () => {
        if (inputValue && !selectedDepts.some(d => d.name === inputValue) && !allDepartments.some(d => d.name === inputValue)) {
            // Optimistic update
            const tempId = `new_${Date.now()}`;
            const newDept = { id: tempId, name: inputValue };
            setAllDepartments(prev => [...prev, newDept]);
            setSelectedDepts(prev => [...prev, newDept]);

            // Server creation (optional here, but handled in updateDocumentDepartments)
        }
        setInputValue("")
    }

    const handleSave = async () => {
        setIsLoading(true);
        const deptNames = selectedDepts.map(d => d.name);
        const result = await updateDocumentDepartments(documentIds, deptNames);
        if (result.success) {
            toast.success("Cập nhật bộ phận thành công!");
        } else {
            toast.error("Đã có lỗi xảy ra.");
        }
        setIsLoading(false);
        setOpen(false);
    }

    const filteredDepts = allDepartments.filter(
        (dept) => !selectedDepts.some((selected) => selected.name === dept.name)
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gán Bộ phận</DialogTitle>
                    <DialogDescription>
                        Chỉ định bộ phận phụ trách cho {documentIds.length} tài liệu.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {selectedDepts.map(dept => (
                        <Badge key={dept.id} variant="secondary" className="text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                            {dept.name}
                            <button onClick={() => handleRemove(dept.id)} className="ml-2 rounded-full hover:bg-indigo-200 p-0.5">
                                &times;
                            </button>
                        </Badge>
                    ))}
                    <Command className="p-0 m-0 w-full">
                        <CommandInput
                            placeholder="Thêm bộ phận..."
                            value={inputValue}
                            onValueChange={setInputValue}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && inputValue) {
                                    e.preventDefault();
                                    handleCreate();
                                }
                            }}
                        />
                        <CommandList>
                            {inputValue && filteredDepts.length > 0 && <CommandEmpty>Không tìm thấy.</CommandEmpty>}
                            {filteredDepts.length > 0 && (
                                <CommandGroup>
                                    {filteredDepts
                                        .filter(d => d.name.toLowerCase().includes(inputValue.toLowerCase()))
                                        .map((dept) => (
                                            <CommandItem
                                                key={dept.id}
                                                value={dept.name}
                                                onSelect={() => handleSelect(dept)}
                                            >
                                                {dept.name}
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            )}
                            {inputValue && !allDepartments.some(d => d.name.toLowerCase() === inputValue.toLowerCase()) && (
                                <CommandGroup>
                                    <CommandItem onSelect={handleCreate}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Tạo mới &quot;{inputValue}&quot;
                                    </CommandItem>
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
