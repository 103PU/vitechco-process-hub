"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Trash, Box, Building, FileText, Search, X, Tag } from "lucide-react" // Restore Tag icon
import { deleteDocuments } from "../../actions"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ManageDepartmentsDialog } from "./manage-departments-dialog"
import { ManageDocumentTypesDialog } from "./manage-document-types-dialog"
import { ManageMasterDepartmentsDialog } from "./manage-master-departments-dialog"
import { MasterTagsDialog } from "./master-tags-dialog" // Restore
import { ManageTagsDialog } from "./manage-tags-dialog" // Restore
import { ManageTopicsDialog } from "./manage-topics-dialog" // NEW import
import { AssignTypeDialog } from "./assign-type-dialog"
import { AssignTopicDialog } from "./assign-topic-dialog"
import { DocumentData } from "./columns"
import { toast } from "sonner"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    documentTypeOptions: { label: string; value: string }[]
    departmentOptions: { label: string; value: string }[]
    topicOptions: { label: string; value: string }[]
    tagOptions: { label: string; value: string }[]
    brandOptions: { label: string; value: string }[]
    modelOptions: { label: string; value: string }[]
}

export function DataTableToolbar<TData>({
    table,
    documentTypeOptions,
    departmentOptions,
    topicOptions,
    tagOptions,
    brandOptions,
    modelOptions,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    const handleDeleteSelected = async () => {
        const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => (row.original as any).id); // eslint-disable-line @typescript-eslint/no-explicit-any
        const result = await deleteDocuments(selectedIds);
        if (result.success) {
            toast.success(`Đã xóa thành công ${selectedIds.length} mục.`);
            table.resetRowSelection();
        } else {
            toast.error("Đã có lỗi xảy ra khi xóa hàng loạt.");
        }
    }

    const selectedRows = table.getFilteredSelectedRowModel().rows;

    return (
        <div className="space-y-4">
            {/* TOP ROW: Search & Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-1 items-center gap-2 w-full sm:max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Tìm kiếm tài liệu..."
                            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("title")?.setFilterValue(event.target.value)
                            }
                            className="h-10 w-full pl-9 bg-white shadow-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                    </div>
                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => table.resetColumnFilters()}
                            className="h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                        >
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* VISIBLE ACTION BUTTONS (Create & Manage) */}
                <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 gap-2 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm">
                                <Box className="h-4 w-4" />
                                <span className="hidden sm:inline">Quản lý</span>
                                <span className="inline sm:hidden">Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        {/* ... Dropdown Content (Same as before) ... */}
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Danh mục dữ liệu</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <ManageMasterDepartmentsDialog>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Building className="mr-2 h-4 w-4 text-indigo-600" />
                                    <span>Bộ phận</span>
                                </DropdownMenuItem>
                            </ManageMasterDepartmentsDialog>

                            <ManageDocumentTypesDialog>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                    <span>Phân Mục</span>
                                </DropdownMenuItem>
                            </ManageDocumentTypesDialog>

                            <ManageTopicsDialog>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Box className="mr-2 h-4 w-4 text-orange-600" />
                                    <span>Loại (Topic)</span>
                                </DropdownMenuItem>
                            </ManageTopicsDialog>

                            <MasterTagsDialog>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Tag className="mr-2 h-4 w-4 text-purple-600" />
                                    <span>Tags & Model</span>
                                </DropdownMenuItem>
                            </MasterTagsDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link
                        href="/admin/documents/new"
                        className="h-10 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
                    >
                        <PlusCircle size={18} />
                        <span>Tạo mới</span>
                    </Link>
                </div>
            </div>

            {/* SECOND ROW: Filters (Flex Wrap) */}
            <div className="flex flex-wrap items-center gap-2 p-1">
                {/* Label */}
                <div className="flex items-center gap-2 mr-2 text-sm font-medium text-gray-500">
                    <Search className="w-3.5 h-3.5" />
                    Bộ lọc:
                </div>

                {/* 1. DEPARTMENT FILTER (MAIN) */}
                {table.getColumn("departments") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("departments")}
                        title="Bộ phận"
                        options={departmentOptions}
                    />
                )}

                {/* 2. CATEGORY FILTER (MAIN) */}
                {table.getColumn("documentType") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("documentType")}
                        title="Phân Mục"
                        options={documentTypeOptions}
                    />
                )}

                {/* 3. TOPIC FILTER */}
                {table.getColumn("topic") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("topic")}
                        title="Topic"
                        options={topicOptions}
                    />
                )}

                {/* 4. BRAND / MODEL (Compact) */}
                {table.getColumn("brand") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("brand")}
                        title="Hãng"
                        options={brandOptions}
                    />
                )}
                {/* 5. MODEL (Hidden on mobile, visible on desktop) */}
                {table.getColumn("model") && (
                    <div className="hidden lg:block">
                        <DataTableFacetedFilter
                            column={table.getColumn("model")}
                            title="Model"
                            options={modelOptions}
                        />
                    </div>
                )}
                {table.getColumn("tags") && (
                    <div className="hidden xl:block">
                        <DataTableFacetedFilter
                            column={table.getColumn("tags")}
                            title="Tags"
                            options={tagOptions}
                        />
                    </div>
                )}
            </div>

            {/* BULK ACTIONS BAR */}
            {selectedRows.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg animate-in fade-in slide-in-from-top-2 overflow-x-auto">
                    <span className="text-sm text-blue-700 font-medium px-2 shrink-0">Chọn {selectedRows.length}:</span>

                    {/* 1. Assign Department */}
                    <ManageDepartmentsDialog
                        documentIds={selectedRows.map(row => (row.original as DocumentData).id)}
                        initialDepartments={[]}
                    >
                        <Button variant="outline" size="sm" className="h-8 bg-white border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm shrink-0">
                            <Building className="mr-2 h-3.5 w-3.5" />
                            Gán Bộ phận
                        </Button>
                    </ManageDepartmentsDialog>

                    {/* 2. Assign Category */}
                    <AssignTypeDialog
                        documentIds={selectedRows.map(row => (row.original as DocumentData).id)}
                    >
                        <Button variant="outline" size="sm" className="h-8 bg-white border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm shrink-0">
                            <FileText className="mr-2 h-3.5 w-3.5" />
                            Gán Phân Mục
                        </Button>
                    </AssignTypeDialog>

                    {/* 3. Assign Topic */}
                    <AssignTopicDialog
                        documentIds={selectedRows.map(row => (row.original as DocumentData).id)}
                    >
                        <Button variant="outline" size="sm" className="h-8 bg-white border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm shrink-0">
                            <Box className="mr-2 h-3.5 w-3.5" />
                            Gán Loại
                        </Button>
                    </AssignTopicDialog>

                    {/* 4. Assign Tags */}
                    <ManageTagsDialog
                        documentIds={selectedRows.map(row => (row.original as DocumentData).id)}
                        initialTags={[]}
                    >
                        <Button variant="outline" size="sm" className="h-8 bg-white border-blue-200 text-blue-700 hover:bg-blue-100 shadow-sm shrink-0">
                            <Tag className="mr-2 h-3.5 w-3.5" />
                            Gán Tags
                        </Button>
                    </ManageTagsDialog>

                    <div className="flex-1"></div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-8 shadow-sm shrink-0">
                                <Trash className="mr-2 h-3.5 w-3.5" />
                                Xóa tất cả
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xóa {selectedRows.length} tài liệu?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-600">
                                    Xóa ngay
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    )
}
