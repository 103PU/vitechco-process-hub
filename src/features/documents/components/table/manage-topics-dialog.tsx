"use client"

import * as React from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getAllTopics, createTopic, updateTopic, deleteTopic, getAllDocumentTypes } from "../../actions"
import { toast } from "sonner"
import { Loader2, Pencil, Trash2, Plus } from "lucide-react"

type TopicData = { id: string; name: string; categoryId: string; category?: { name: string } }
type CategoryData = { id: string; name: string }

export function ManageTopicsDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    const [topics, setTopics] = React.useState<TopicData[]>([])
    const [categories, setCategories] = React.useState<CategoryData[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    // Form state
    const [newName, setNewName] = React.useState("")
    const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>("")
    const [editingTopic, setEditingTopic] = React.useState<TopicData | null>(null)

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        const [topicsRes, catsRes] = await Promise.all([
            getAllTopics(),
            getAllDocumentTypes()
        ])

        if (topicsRes.success) setTopics(topicsRes.topics || [])
        if (catsRes.success) {
            setCategories(catsRes.types || [])
            // Set default category if none selected
            if (!selectedCategoryId && catsRes.types && catsRes.types.length > 0) {
                setSelectedCategoryId(catsRes.types[0].id)
            }
        }
        setIsLoading(false)
    }, [selectedCategoryId])

    React.useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open, fetchData])

    const handleCreate = async () => {
        if (!newName.trim() || !selectedCategoryId) return

        const result = await createTopic(newName, selectedCategoryId)
        if (result.success) {
            toast.success("Tạo Loại thành công")
            setNewName("")
            fetchData()
        } else {
            toast.error("Không thể tạo Loại")
        }
    }

    const handleUpdate = async () => {
        if (!editingTopic || !newName.trim() || !selectedCategoryId) return

        const result = await updateTopic(editingTopic.id, newName, selectedCategoryId)
        if (result.success) {
            toast.success("Cập nhật thành công")
            setEditingTopic(null)
            setNewName("")
            fetchData()
        } else {
            toast.error("Không thể cập nhật")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa?")) return

        const result = await deleteTopic(id)
        if (result.success) {
            toast.success("Đã xóa Loại")
            fetchData()
        } else {
            toast.error("Xóa thất bại")
        }
    }

    const startEdit = (topic: TopicData) => {
        setEditingTopic(topic)
        setNewName(topic.name)
        setSelectedCategoryId(topic.categoryId)
    }

    const cancelEdit = () => {
        setEditingTopic(null)
        setNewName("")
    }

    // Sort topics by category
    const groupedTopics = React.useMemo(() => {
        const grouped: Record<string, TopicData[]> = {}
        topics.forEach(t => {
            const catName = t.category?.name || "Chưa phân loại"
            if (!grouped[catName]) grouped[catName] = []
            grouped[catName].push(t)
        })
        return grouped
    }, [topics])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Quản lý Loại Tài Liệu (Topic)</DialogTitle>
                    <DialogDescription>
                        Thêm, sửa, xóa các loại tài liệu theo Phân Mục.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2 items-end py-4 border-b">
                    <div className="grid gap-1.5 flex-1">
                        <label className="text-sm font-medium">Tên loại</label>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nhập tên loại..."
                        />
                    </div>
                    <div className="grid gap-1.5 w-[200px]">
                        <label className="text-sm font-medium">Thuộc Phân Mục</label>
                        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn phân mục" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={editingTopic ? handleUpdate : handleCreate} disabled={isLoading}>
                        {editingTopic ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {editingTopic ? "Cập nhật" : "Thêm mới"}
                    </Button>
                    {editingTopic && (
                        <Button variant="ghost" onClick={cancelEdit}>Hủy</Button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px] py-4 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : Object.keys(groupedTopics).length === 0 ? (
                        <p className="text-center text-gray-500">Chưa có dữ liệu.</p>
                    ) : (
                        Object.entries(groupedTopics).map(([categoryName, groupTopics]) => (
                            <div key={categoryName} className="space-y-2">
                                <h3 className="font-semibold text-sm text-gray-700 bg-gray-100 p-2 rounded-md">
                                    {categoryName}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
                                    {groupTopics.map(topic => (
                                        <div key={topic.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                                            <span className="font-medium">{topic.name}</span>
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(topic)}>
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(topic.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
