"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getAllTopics, updateDocumentTopicRelation } from "../../actions"
import { toast } from "sonner"

type TopicData = { id: string, name: string };

interface AssignTopicDialogProps {
    documentIds: string[];
    children: React.ReactNode;
}

export function AssignTopicDialog({ documentIds, children }: AssignTopicDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [topics, setTopics] = React.useState<TopicData[]>([])
    const [selectedTopicId, setSelectedTopicId] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (open) {
            getAllTopics().then(result => {
                if (result.success) {
                    setTopics(result.topics || []);
                }
            })
            setSelectedTopicId("");
        }
    }, [open])

    const handleSave = async () => {
        if (!selectedTopicId) return;

        setIsLoading(true);
        const result = await updateDocumentTopicRelation(documentIds, selectedTopicId);
        if (result.success) {
            toast.success("Cập nhật Loại tài liệu thành công!");
            setOpen(false);
        } else {
            toast.error("Đã có lỗi xảy ra.");
        }
        setIsLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gán Loại Tài Liệu (Topic)</DialogTitle>
                    <DialogDescription>
                        Chọn Loại tài liệu mới cho {documentIds.length} mục đã chọn.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedTopicId} value={selectedTopicId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn loại..." />
                        </SelectTrigger>
                        <SelectContent>
                            {topics.map((topic) => (
                                <SelectItem key={topic.id} value={topic.id}>
                                    {topic.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={isLoading || !selectedTopicId}>
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
