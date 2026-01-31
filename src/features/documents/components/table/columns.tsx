"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, Tag, Eye, Pencil, Trash2, Copy, Building, FileText } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { deleteDocument } from "../../actions"
import { getTagColors } from "@/lib/utils"
import { ManageTagsDialog } from "./manage-tags-dialog"
import { ManageDepartmentsDialog } from "./manage-departments-dialog"
import { AssignTypeDialog } from "./assign-type-dialog"
import { toast } from "sonner"

export type DocumentData = {
    id: string
    title: string
    documentType: string | null
    topic: string | null
    updatedAt: string
    tags: { id: string, name: string }[]
    departments: { id: string, name: string }[]
    machineModels: { name: string, brand: string | null }[]
}

export const columns: ColumnDef<DocumentData>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:text-white rounded-full"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:text-white rounded-full"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Tiêu đề
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[300px] lg:max-w-[500px] truncate font-medium block" title={row.getValue("title")}>
                        {row.getValue("title")}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "documentType",
        header: "Phân mục",
        cell: ({ row }) => {
            const type = row.getValue("documentType") as string;
            if (!type) return <span className="text-gray-400 italic">Chưa phân loại</span>;

            return <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                {type}
            </Badge>
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        accessorKey: "topic",
        header: "Loại (Topic)",
        cell: ({ row }) => {
            const topic = row.getValue("topic") as string;
            if (!topic) return <span className="text-gray-400">-</span>;

            return <Badge variant="outline" className="font-medium text-gray-700">
                {topic}
            </Badge>
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
        id: "brand",
        accessorFn: (row) => {
            const brands = row.machineModels
                .map(m => m.brand)
                .filter((b): b is string => !!b);
            // Unique brands
            return Array.from(new Set(brands));
        },
        header: "Hãng (Brand)",
        cell: ({ row }) => {
            const brands = row.getValue("brand") as string[];
            if (!brands || brands.length === 0) return <span className="text-gray-400 text-xs">-</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {brands.map((b, i) => (
                        <Badge key={i} variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                            {b}
                        </Badge>
                    ))}
                </div>
            )
        },
        // Hide brand column on screens smaller than lg to save space
        enableHiding: true,
        filterFn: (row, id, value: string[]) => {
            const rowValue = row.getValue(id) as string[];
            if (!value.length) return true;
            if (!rowValue) return false;
            return rowValue.some(v => value.includes(v));
        },
    },
    {
        id: "model",
        accessorFn: (row) => {
            return row.machineModels.map(m => m.name);
        },
        header: "Model Máy",
        cell: ({ row }) => {
            const models = row.getValue("model") as string[];
            if (!models || models.length === 0) return <span className="text-gray-400 text-xs">Chung</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {models.map((m, i) => (
                        <span key={i} className="text-xs font-medium text-gray-700 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                            {m}
                        </span>
                    ))}
                </div>
            )
        },
        filterFn: (row, id, value: string[]) => {
            const rowValue = row.getValue(id) as string[];
            if (!value.length) return true;
            if (!rowValue) return false;
            // Check if ANY of the row's models match the filter values
            return rowValue.some(v => value.includes(v));
        },
    },
    {
        accessorKey: "departments",
        header: "Bộ phận",
        cell: ({ row }) => {
            const departments = row.original.departments;
            if (!departments || departments.length === 0) return null;
            return (
                <div className="flex flex-wrap gap-1">
                    {departments.map(dept => (
                        <Badge
                            key={dept.id}
                            variant="secondary"
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 font-normal"
                        >
                            {dept.name}
                        </Badge>
                    ))}
                </div>
            )
        },
        // We define filterFn but we don't strictly need it if we filter in Toolbar with a simple match
        // But for advanced filtering it is good practice
        filterFn: (row, columnId, filterValue) => {
            const rowValues = row.getValue(columnId) as { id: string, name: string }[];
            if (!filterValue || filterValue.length === 0) return true;
            if (!rowValues) return false;
            return rowValues.some(item => filterValue.includes(item.name));
        },
    },
    {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
            const tags = row.original.tags;
            if (!tags || tags.length === 0) return null;
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.map(tag => {
                        const colors = getTagColors(tag.name);
                        return (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className="font-normal"
                                style={{
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                    borderColor: colors.border
                                }}
                            >
                                {tag.name}
                            </Badge>
                        )
                    })}
                </div>
            )
        },
        filterFn: (row, columnId, filterValue) => {
            const rowValues = row.getValue(columnId) as { id: string, name: string }[];
            if (!filterValue || filterValue.length === 0) return true;
            if (!rowValues) return false;
            return rowValues.some(item => filterValue.includes(item.name));
        },
    },
    {
        accessorKey: "updatedAt",
        header: "Ngày cập nhật",
        cell: ({ row }) => {
            const date = new Date(row.getValue("updatedAt"));
            const formattedDate = date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            return <div className="text-sm">{formattedDate}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const document = row.original

            return (
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(document.id);
                                toast.success("Đã sao chép ID quy trình");
                            }}>
                                <Copy className="mr-2 h-4 w-4 text-gray-500" />
                                <span>Sao chép ID</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link href={`/docs/${document.id}`}>
                                    <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                    <span>Xem chi tiết</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link href={`/admin/documents/edit/${document.id}`}>
                                    <Pencil className="mr-2 h-4 w-4 text-orange-600" />
                                    <span>Chỉnh sửa</span>
                                </Link>
                            </DropdownMenuItem>

                            <AssignTypeDialog documentIds={[document.id]}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <FileText className="mr-2 h-4 w-4 text-green-600" />
                                    <span>Gán Loại</span>
                                </DropdownMenuItem>
                            </AssignTypeDialog>

                            <ManageTagsDialog documentIds={[document.id]} initialTags={document.tags}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Tag className="mr-2 h-4 w-4 text-purple-600" />
                                    <span>Gán Tags</span>
                                </DropdownMenuItem>
                            </ManageTagsDialog>

                            <ManageDepartmentsDialog documentIds={[document.id]} initialDepartments={document.departments}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Building className="mr-2 h-4 w-4 text-indigo-600" />
                                    <span>Gán Bộ phận</span>
                                </DropdownMenuItem>
                            </ManageDepartmentsDialog>

                            <DropdownMenuSeparator />

                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Xóa</span>
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Hành động này không thể được hoàn tác. Thao tác này sẽ xóa vĩnh viễn quy trình
                                <span className="font-bold"> &quot;{document.title}&quot;</span>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    const result = await deleteDocument(document.id)
                                    if (result.success) {
                                        toast.success(`Đã xóa quy trình "${document.title}"`);
                                    } else {
                                        toast.error("Đã có lỗi xảy ra khi xóa.");
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Tiếp tục
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        },
    },
]
