"use client"

import * as React from "react"
import { FileText } from "lucide-react"

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
import { getAllDocumentTypes } from "../../actions" // reusing existing action
import { updateDocumentTypeRelation } from "../../actions" // Need to create this
import { toast } from "sonner"

type TypeData = { id: string, name: string };

interface AssignTypeDialogProps {
    documentIds: string[];
    children: React.ReactNode;
}

export function AssignTypeDialog({ documentIds, children }: AssignTypeDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [types, setTypes] = React.useState<TypeData[]>([])
    const [selectedTypeId, setSelectedTypeId] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (open) {
            getAllDocumentTypes().then(result => {
                if (result.success) {
                    setTypes(result.types);
                }
            })
            setSelectedTypeId(""); 
        }
    }, [open])

    const handleSave = async () => {
        if (!selectedTypeId) return;
        
        setIsLoading(true);
        const result = await updateDocumentTypeRelation(documentIds, selectedTypeId);
        if(result.success) {
            toast.success("Cập nhật loại tài liệu thành công!");
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
                    <DialogTitle>Gán Loại Tài Liệu</DialogTitle>
                    <DialogDescription>
                        Chọn loại tài liệu mới cho {documentIds.length} mục đã chọn.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedTypeId} value={selectedTypeId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn loại..." />
                        </SelectTrigger>
                        <SelectContent>
                            {types.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={isLoading || !selectedTypeId}>
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
