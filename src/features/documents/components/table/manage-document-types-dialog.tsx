"use client"

import * as React from "react"
import { PlusCircle, Edit2, Save, X, Trash2, FileText } from "lucide-react"

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
import { getAllDocumentTypes, createDocumentType, updateDocumentType, deleteDocumentType } from "../../actions"
import { toast } from "sonner"
import { getTagColors } from "@/lib/utils"
import { getDocumentTypeIcon } from "../../utils/ui-helpers"

type TypeData = { id: string, name: string };

export function ManageDocumentTypesDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [types, setTypes] = React.useState<TypeData[]>([])
    const [newName, setNewName] = React.useState("")
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editValue, setEditValue] = React.useState("")

    const fetchTypes = async () => {
        const result = await getAllDocumentTypes();
        if (result.success) {
            setTypes(result.types);
        }
    }

    React.useEffect(() => {
        if (open) {
            fetchTypes();
        }
    }, [open])

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const result = await createDocumentType(newName);
        if (result.success) {
            toast.success("Đã tạo loại mới");
            setNewName("");
            fetchTypes();
        } else {
            toast.error(result.error || "Lỗi khi tạo loại");
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa loại này?")) {
            const result = await deleteDocumentType(id);
            if (result.success) {
                toast.success("Đã xóa loại");
                fetchTypes();
            } else {
                toast.error("Lỗi khi xóa loại");
            }
        }
    }

    const startEdit = (type: TypeData) => {
        setEditingId(type.id);
        setEditValue(type.name);
    }

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    }

    const saveEdit = async (id: string) => {
        if (!editValue.trim()) return;
        const result = await updateDocumentType(id, editValue);
        if (result.success) {
            toast.success("Đã cập nhật");
            setEditingId(null);
            fetchTypes();
        } else {
            toast.error(result.error || "Lỗi khi cập nhật");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="text-blue-600" />
                        Quản lý Loại Tài liệu
                    </DialogTitle>
                    <DialogDescription>
                        Thêm, sửa, xóa các loại tài liệu. Icon sẽ được tự động gán dựa trên tên loại.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 my-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="flex-1">
                        <Input
                            placeholder="Nhập tên loại mới (VD: Quy trình, Hướng dẫn...)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="bg-white"
                        />
                    </div>
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                        <PlusCircle className="mr-2 h-4 w-4" /> Thêm mới
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {types.map(type => {
                        const Icon = getDocumentTypeIcon(type.name);
                        return (
                            <div key={type.id} className="group flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all hover:border-blue-200">
                                {editingId === type.id ? (
                                    <div className="flex flex-1 items-center gap-2 animate-in fade-in zoom-in-95">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Icon className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="h-9 flex-1"
                                            autoFocus
                                        />
                                        <Button size="icon" variant="default" onClick={() => saveEdit(type.id)} className="h-9 w-9 bg-green-600 hover:bg-green-700 text-white" title="Lưu">
                                            <Save size={16} />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-9 w-9 text-red-500 hover:bg-red-50" title="Hủy">
                                            <X size={16} />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{type.name}</p>
                                                <Badge
                                                    variant="secondary"
                                                    className="mt-1 text-[10px] px-1.5 py-0 h-5"
                                                >
                                                    ID: {type.id.slice(-4)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(type)} className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Sửa">
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDelete(type.id)} className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Xóa">
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {types.length === 0 && (
                        <div className="text-center py-10 text-gray-400 italic">
                            Chưa có loại nào. Hãy thêm mới!
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
