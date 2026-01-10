"use client"

import * as React from "react"
import { PlusCircle, Edit2, Save, X, Trash2, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../actions"
import { toast } from "sonner"

type DeptData = { id: string, name: string };

export function ManageMasterDepartmentsDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [depts, setDepts] = React.useState<DeptData[]>([])
    const [newName, setNewName] = React.useState("")
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editValue, setEditValue] = React.useState("")

    const fetchDepts = async () => {
        const result = await getAllDepartments();
        if (result.success) {
            setDepts(result.departments);
        }
    }

    React.useEffect(() => {
        if (open) {
            fetchDepts();
        }
    }, [open])

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const result = await createDepartment(newName);
        if (result.success) {
            toast.success("Đã tạo bộ phận mới");
            setNewName("");
            fetchDepts();
        } else {
            toast.error("Lỗi khi tạo bộ phận");
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa bộ phận này?")) {
            const result = await deleteDepartment(id);
            if (result.success) {
                toast.success("Đã xóa bộ phận");
                fetchDepts();
            } else {
                toast.error("Lỗi khi xóa bộ phận");
            }
        }
    }

    const startEdit = (dept: DeptData) => {
        setEditingId(dept.id);
        setEditValue(dept.name);
    }

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    }

    const saveEdit = async (id: string) => {
        if (!editValue.trim()) return;
        const result = await updateDepartment(id, editValue);
        if (result.success) {
            toast.success("Đã cập nhật");
            setEditingId(null);
            fetchDepts();
        } else {
            toast.error("Lỗi khi cập nhật");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Quản lý Bộ phận</DialogTitle>
                    <DialogDescription>
                        Danh sách các phòng ban/bộ phận trong công ty.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-2 my-4">
                    <Input 
                        placeholder="Tên bộ phận mới..." 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <Button onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Thêm
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                    {depts.map(dept => (
                        <div key={dept.id} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                            {editingId === dept.id ? (
                                <div className="flex flex-1 items-center gap-2">
                                    <Input 
                                        value={editValue} 
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-8"
                                    />
                                    <Button size="icon" variant="ghost" onClick={() => saveEdit(dept.id)} className="h-8 w-8 text-green-600">
                                        <Save size={16} />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-red-500">
                                        <X size={16} />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Badge 
                                        variant="secondary" 
                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                    >
                                        {dept.name}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => startEdit(dept)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(dept.id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
