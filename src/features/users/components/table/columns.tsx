"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, UserCog, Trash2, ShieldCheck, ShieldAlert } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
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

import { updateUserRole, deleteUser } from "../../actions"
import { toast } from "sonner"
import { Role } from "@/lib/auth/rbac"

export type UserData = {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    createdAt: string
}

export const columns: ColumnDef<UserData>[] = [
    {
        accessorKey: "image",
        header: "",
        cell: ({ row }) => {
            const image = row.getValue("image") as string
            return (
                <div className="w-10 h-10 relative">
                    {image ? (
                        <Image src={image} alt="Avatar" fill className="rounded-full object-cover border border-gray-200" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                            <UserCog size={20} className="text-gray-400" />
                        </div>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Họ và tên
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Vai trò",
        cell: ({ row }) => {
            const role = row.getValue("role") as string
            const isAdmin = role === 'ADMIN'
            return (
                <Badge
                    variant={isAdmin ? "default" : "secondary"}
                    className={isAdmin ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200" : "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"}
                >
                    {isAdmin ? (
                        <div className="flex items-center gap-1"><ShieldCheck size={12} /> Admin</div>
                    ) : (
                        <div className="flex items-center gap-1"><UserCog size={12} /> Technician</div>
                    )}
                </Badge>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: "Ngày tham gia",
        cell: ({ row }) => {
            return <div className="text-sm">{new Date(row.getValue("createdAt")).toLocaleDateString('vi-VN')}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original
            const isCurrentlyAdmin = user.role === 'ADMIN'

            return (
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={async () => {
                                const newRole = isCurrentlyAdmin ? Role.TECHNICIAN : Role.ADMIN;
                                const result = await updateUserRole(user.id, newRole);
                                if (result.success) {
                                    toast.success(`Đã chuyển ${user.name} sang ${newRole}`);
                                } else {
                                    toast.error(result.error);
                                }
                            }}>
                                {isCurrentlyAdmin ? (
                                    <><ShieldAlert className="mr-2 h-4 w-4 text-orange-500" /> Hạ cấp quyền</>
                                ) : (
                                    <><ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Nâng cấp Admin</>
                                )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa tài khoản
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa người dùng?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tài khoản <span className="font-bold">{user.email}</span> sẽ bị xóa khỏi hệ thống và không thể truy cập được nữa.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={async () => {
                                    const result = await deleteUser(user.id);
                                    if (result.success) {
                                        toast.success("Đã xóa người dùng thành công");
                                    } else {
                                        toast.error(result.error);
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Xóa vĩnh viễn
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        },
    },
]
