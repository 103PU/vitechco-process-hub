'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { createDocument, updateDocument } from '../actions'
import { useDropzone } from 'react-dropzone'
import { parseDocumentAction } from '@/app/actions/parse-document'
import { FileUp, Loader2 } from 'lucide-react'
import { useCallback, useState } from 'react'
type SimpleTag = { id: string; name: string }
type SimpleDocumentType = { id: string; name: string }
type SimpleDepartment = { id: string; name: string }
type SimpleMachineModel = { id: string; name: string }

const documentSchema = z.object({
    title: z.string().min(3, { message: 'Tiêu đề phải có ít nhất 3 ký tự.' }),
    content: z.string().min(10, { message: 'Nội dung không được để trống.' }),
    documentTypeId: z.string().min(1, { message: 'Vui lòng chọn loại quy trình.' }),
    tagIds: z.array(z.string()).optional(),
    departmentIds: z.array(z.string()).optional(),
    machineModelIds: z.array(z.string()).optional(),
})

interface DocumentFormProps {
    documentTypes: SimpleDocumentType[];
    allTags: SimpleTag[];
    allDepartments: SimpleDepartment[];
    allMachineModels: SimpleMachineModel[];
    initialData?: {
        id: string;
        title: string;
        content: string;
        documentTypeId: string | null;
        tags?: { tagId: string }[];
        departments?: { departmentId: string }[];
        machineModels?: { machineModelId: string }[];
    }
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="border border-gray-300 rounded-t-lg p-2 flex flex-wrap gap-2 bg-gray-50">
            <Button type="button" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'default' : 'outline'} size="sm">Bold</Button>
            <Button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'default' : 'outline'} size="sm">Italic</Button>
            <Button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'default' : 'outline'} size="sm">Strike</Button>
            <Button type="button" onClick={() => editor.chain().focus().setParagraph().run()} variant={editor.isActive('paragraph') ? 'default' : 'outline'} size="sm">Para</Button>
            <Button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'} size="sm">H1</Button>
            <Button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'} size="sm">H2</Button>
            <Button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'default' : 'outline'} size="sm">Bullet</Button>
            <Button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'default' : 'outline'} size="sm">Ordered</Button>
        </div>
    )
}

export function DocumentForm({ documentTypes, allTags, allDepartments, allMachineModels, initialData }: DocumentFormProps) {
    const router = useRouter();
    const isEditMode = !!initialData;

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, getValues } = useForm<z.infer<typeof documentSchema>>({
        resolver: zodResolver(documentSchema),
        defaultValues: {
            title: initialData?.title || '',
            content: initialData?.content || '',
            documentTypeId: initialData?.documentTypeId || undefined,
            tagIds: initialData?.tags?.map(t => t.tagId) || [],
            departmentIds: initialData?.departments?.map(d => d.departmentId) || [],
            machineModelIds: initialData?.machineModels?.map(m => m.machineModelId) || [],
        }
    });

    const editor = useEditor({
        extensions: [StarterKit],
        content: initialData?.content || '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none min-h-[300px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            },
        },
        onUpdate({ editor }) {
            setValue('content', editor.getHTML(), { shouldValidate: true })
        },
    })

    const onSubmit = async (data: z.infer<typeof documentSchema>) => {
        try {
            let result;
            if (isEditMode && initialData) {
                result = await updateDocument(initialData.id, data);
            } else {
                result = await createDocument(data);
            }

            if (result.success) {
                toast.success(isEditMode ? "Cập nhật thành công!" : "Tạo quy trình thành công!");
                router.push('/admin/documents');
            } else {
                toast.error(result.error || "Đã có lỗi xảy ra.");
            }
        } catch {
            toast.error("Đã có lỗi không xác định xảy ra.");
        }
    }

    // --- SMART IMPORT LOGIC ---
    const [isImporting, setIsImporting] = useState(false);
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!editor) {
            toast.error("Trình soạn thảo chưa sẵn sàng.");
            return;
        }

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await parseDocumentAction(formData);

            if (result.success && result.html) {
                // Confirm replacement if content exists
                if (editor.getText().trim().length > 0) {
                    const confirmReplace = window.confirm("Nội dung hiện tại sẽ bị thay thế. Bạn có chắc chắn muốn tiếp tục?");
                    if (!confirmReplace) {
                        setIsImporting(false);
                        return;
                    }
                }

                editor.commands.setContent(result.html);
                toast.success("Đã nhập nội dung từ tài liệu!");

                // Auto-fill title if empty
                if (!getValues('title')) {
                    const fileName = file.name.replace(/\.[^/.]+$/, "");
                    setValue('title', fileName);
                }

            } else {
                toast.error(result.error || "Không thể đọc nội dung file.");
            }
        } catch (error) {
            toast.error("Lỗi nhập liệu.");
        } finally {
            setIsImporting(false);
        }
    }, [editor, setValue]); // Fixed: Added dependencies

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    });




    return (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 space-y-6">
                {/* Smart Import Zone */}
                <div {...getRootProps()} className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
            ${isImporting ? 'opacity-50 pointer-events-none' : ''}
        `}>
                    <input {...getInputProps()} />
                    {isImporting ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p>Đang xử lý tài liệu...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileUp className="h-8 w-8" />
                            <p className="font-medium">Kéo thả file DOCX, Excel, PDF vào đây</p>
                            <p className="text-sm text-gray-400">hoặc click để chọn file (Smart Import)</p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <div>
                        <Label htmlFor="title">Tiêu đề quy trình</Label>
                        <Input id="title" {...register('title')} className="mt-1" />
                        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                        <Label>Nội dung chi tiết</Label>
                        <div className="mt-1">
                            <MenuBar editor={editor} />
                            <EditorContent editor={editor} />
                        </div>
                        {errors.content && <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>}
                    </div>
                </div>
            </div>

            {/* Right Column: Metadata & Settings */}
            <div className="space-y-6">
                {/* Actions */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="font-semibold text-gray-900">Tác vụ</h3>
                    <div className="flex flex-col gap-3">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : (isEditMode ? "Lưu thay đổi" : "Tạo quy trình")}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
                    </div>
                </div>

                {/* Classification */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="font-semibold text-gray-900">Phân loại</h3>

                    <div>
                        <Label htmlFor="documentTypeId">Loại tài liệu</Label>
                        <Controller
                            control={control}
                            name="documentTypeId"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Chọn loại..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {documentTypes.map(type => (
                                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.documentTypeId && <p className="text-sm text-red-600 mt-1">{errors.documentTypeId.message}</p>}
                    </div>

                    <div className="pt-2">
                        <Label className="mb-2 block">Tags (Thẻ)</Label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                            <Controller
                                control={control}
                                name="tagIds"
                                render={({ field }) => (
                                    <>
                                        {allTags.map(tag => (
                                            <div key={tag.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`tag-${tag.id}`}
                                                    checked={field.value?.includes(tag.id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = field.value || [];
                                                        if (checked) {
                                                            field.onChange([...current, tag.id]);
                                                        } else {
                                                            field.onChange(current.filter(id => id !== tag.id));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`tag-${tag.id}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                    {tag.name}
                                                </label>
                                            </div>
                                        ))}
                                    </>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Departments & Machines */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h3 className="font-semibold text-gray-900">Phạm vi áp dụng</h3>

                    <div>
                        <Label className="mb-2 block">Phòng ban</Label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                            <Controller
                                control={control}
                                name="departmentIds"
                                render={({ field }) => (
                                    <>
                                        {allDepartments.map(dept => (
                                            <div key={dept.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`dept-${dept.id}`}
                                                    checked={field.value?.includes(dept.id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = field.value || [];
                                                        if (checked) {
                                                            field.onChange([...current, dept.id]);
                                                        } else {
                                                            field.onChange(current.filter(id => id !== dept.id));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`dept-${dept.id}`} className="text-sm cursor-pointer">
                                                    {dept.name}
                                                </label>
                                            </div>
                                        ))}
                                    </>
                                )}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Label className="mb-2 block">Dòng máy (Model)</Label>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                            <Controller
                                control={control}
                                name="machineModelIds"
                                render={({ field }) => (
                                    <>
                                        {allMachineModels.map(model => (
                                            <div key={model.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`model-${model.id}`}
                                                    checked={field.value?.includes(model.id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = field.value || [];
                                                        if (checked) {
                                                            field.onChange([...current, model.id]);
                                                        } else {
                                                            field.onChange(current.filter(id => id !== model.id));
                                                        }
                                                    }}
                                                />
                                                <label htmlFor={`model-${model.id}`} className="text-sm cursor-pointer">
                                                    {model.name}
                                                </label>
                                            </div>
                                        ))}
                                    </>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}