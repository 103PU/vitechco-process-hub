"use client"

import * as React from "react"
import { PlusCircle, Tag, Trash2, Edit2, Save, X } from "lucide-react"

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
import { getAllTags, createTag, updateTag, deleteTag } from "../../actions"
import { toast } from "sonner"
import { getBgColorForString, getTextColorForString } from "@/lib/utils"

type TagType = { id: string, name: string };

export function MasterTagsDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [tags, setTags] = React.useState<TagType[]>([])
    const [newTagName, setNewTagName] = React.useState("")
    const [editingTagId, setEditingTagId] = React.useState<string | null>(null)
    const [editValue, setEditValue] = React.useState("")

    const fetchTags = async () => {
        const result = await getAllTags();
        if (result.success) {
            setTags(result.tags);
        }
    }

    React.useEffect(() => {
        if (open) {
            fetchTags();
        }
    }, [open])

    const handleCreate = async () => {
        if (!newTagName.trim()) return;
        const result = await createTag(newTagName);
        if (result.success) {
            toast.success("Đã tạo tag mới");
            setNewTagName("");
            fetchTags();
        } else {
            toast.error("Lỗi khi tạo tag");
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa tag này? Nó sẽ bị gỡ khỏi tất cả quy trình.")) {
            const result = await deleteTag(id);
            if (result.success) {
                toast.success("Đã xóa tag");
                fetchTags();
            } else {
                toast.error("Lỗi khi xóa tag");
            }
        }
    }

    const startEdit = (tag: TagType) => {
        setEditingTagId(tag.id);
        setEditValue(tag.name);
    }

    const cancelEdit = () => {
        setEditingTagId(null);
        setEditValue("");
    }

    const saveEdit = async (id: string) => {
        if (!editValue.trim()) return;
        const result = await updateTag(id, editValue);
        if (result.success) {
            toast.success("Đã cập nhật tag");
            setEditingTagId(null);
            fetchTags();
        } else {
            toast.error("Lỗi khi cập nhật tag");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Quản lý Tags Hệ thống</DialogTitle>
                    <DialogDescription>
                        Thêm, sửa, xóa các tags dùng chung cho toàn bộ hệ thống.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-2 my-4">
                    <Input 
                        placeholder="Tên tag mới..." 
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <Button onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Thêm
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                    {tags.map(tag => (
                        <div key={tag.id} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                            {editingTagId === tag.id ? (
                                <div className="flex flex-1 items-center gap-2">
                                    <Input 
                                        value={editValue} 
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-8"
                                    />
                                    <Button size="icon" variant="ghost" onClick={() => saveEdit(tag.id)} className="h-8 w-8 text-green-600">
                                        <Save size={16} />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-red-500">
                                        <X size={16} />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Badge 
                                        variant="outline" 
                                        style={{ 
                                            backgroundColor: getBgColorForString(tag.name), 
                                            color: getTextColorForString(tag.name),
                                            borderColor: getTextColorForString(tag.name)
                                        }}
                                    >
                                        {tag.name}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => startEdit(tag)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(tag.id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
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
