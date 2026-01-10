"use client"

import * as React from "react"
import { Check, PlusCircle, Tag } from "lucide-react"

import { cn } from "@/lib/utils"
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
import { getAllTags, updateDocumentTags } from "../../actions"
import { toast } from "sonner" // We will add this component

type Tag = { id: string, name: string };

interface ManageTagsDialogProps {
    documentIds: string[];
    initialTags: Tag[];
    children: React.ReactNode;
}

export function ManageTagsDialog({ documentIds, initialTags, children }: ManageTagsDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [allTags, setAllTags] = React.useState<Tag[]>([])
    const [selectedTags, setSelectedTags] = React.useState<Tag[]>(initialTags)
    const [inputValue, setInputValue] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (open) {
            getAllTags().then(result => {
                if (result.success) {
                    setAllTags(result.tags)
                }
            })
            // Reset selected tags when opening for a new set of documents
            setSelectedTags(initialTags);
        }
    }, [open, initialTags])

    const handleTagSelect = (tag: Tag) => {
        setSelectedTags(prev => [...prev, tag])
        setInputValue("")
    }

    const handleTagRemove = (tagId: string) => {
        setSelectedTags(prev => prev.filter(t => t.id !== tagId))
    }

    const handleCreateTag = () => {
        if (inputValue && !selectedTags.some(t => t.name === inputValue) && !allTags.some(t => t.name === inputValue)) {
            const newTag = { id: `new_${inputValue}`, name: inputValue };
            setAllTags(prev => [...prev, newTag]);
            setSelectedTags(prev => [...prev, newTag]);
        }
        setInputValue("")
    }

    const handleSave = async () => {
        setIsLoading(true);
        const tagNames = selectedTags.map(t => t.name);
        const result = await updateDocumentTags(documentIds, tagNames);
        if(result.success) {
            toast.success("Cập nhật tags thành công!");
        } else {
            toast.error("Đã có lỗi xảy ra.");
        }
        setIsLoading(false);
        setOpen(false);
    }

    const filteredTags = allTags.filter(
        (tag) => !selectedTags.some((selected) => selected.name === tag.name)
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Quản lý Tags</DialogTitle>
                    <DialogDescription>
                        Thêm hoặc xóa tags cho {documentIds.length} quy trình đã chọn.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {selectedTags.map(tag => (
                        <Badge key={tag.id} variant="secondary" className="text-sm">
                            {tag.name}
                            <button onClick={() => handleTagRemove(tag.id)} className="ml-2 rounded-full hover:bg-gray-300 p-0.5">
                                &times;
                            </button>
                        </Badge>
                    ))}
                     <Command className="p-0 m-0 w-full">
                        <CommandInput 
                            placeholder="Thêm tag..." 
                            value={inputValue}
                            onValueChange={setInputValue}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && inputValue) {
                                    e.preventDefault();
                                    handleCreateTag();
                                }
                            }}
                        />
                        <CommandList>
                            {inputValue && filteredTags.length > 0 && <CommandEmpty>Không tìm thấy tag.</CommandEmpty>}
                            {filteredTags.length > 0 && (
                                <CommandGroup>
                                {filteredTags
                                    .filter(tag => tag.name.toLowerCase().includes(inputValue.toLowerCase()))
                                    .map((tag) => (
                                    <CommandItem
                                        key={tag.id}
                                        value={tag.name}
                                        onSelect={() => handleTagSelect(tag)}
                                    >
                                        {tag.name}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            )}
                             {inputValue && !allTags.some(t => t.name.toLowerCase() === inputValue.toLowerCase()) && (
                                <CommandGroup>
                                    <CommandItem onSelect={handleCreateTag}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Tạo mới "{inputValue}"
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
