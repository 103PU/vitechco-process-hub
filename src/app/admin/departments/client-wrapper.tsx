'use client';

import { createDepartment, deleteDepartment } from '@/app/actions/admin-departments';
import { AdminTable } from '@/components/admin/admin-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type Department = {
    id: string;
    name: string;
    code: string;
    description: string | null;
    _count: { documents: number };
};

export function DepartmentClientWrapper({ initialData }: { initialData: any[] }) {
    const [open, setOpen] = useState(false);

    const columns: ColumnDef<Department>[] = [
        {
            accessorKey: "code",
            header: "Mã PB",
        },
        {
            accessorKey: "name",
            header: "Tên Phòng Ban",
        },
        {
            accessorKey: "_count.documents",
            header: "Số tài liệu",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const dept = row.original;
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={async () => {
                            if (confirm(`Xóa phòng ban ${dept.name}?`)) {
                                const res = await deleteDepartment(dept.id);
                                if (res.success) toast.success("Đã xóa");
                                else toast.error(res.error);
                            }
                        }}
                    >
                        <Trash2 size={16} />
                    </Button>
                )
            }
        }
    ];

    async function handleSubmit(formData: FormData) {
        const res = await createDepartment(formData);
        if (res.success) {
            toast.success("Đã tạo phòng ban mới");
            setOpen(false);
        } else {
            toast.error(res.error);
        }
    }

    return (
        <AdminTable
            columns={columns}
            data={initialData}
            searchKey="name"
            actions={
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus size={16} /> Thêm mới</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm Phòng Ban</DialogTitle>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 py-4">
                            <div>
                                <Label>Mã Phòng Ban (Code)</Label>
                                <Input name="code" placeholder="Vd: IT, HR, FIN" required />
                            </div>
                            <div>
                                <Label>Tên Phòng Ban</Label>
                                <Input name="name" placeholder="Vd: Công nghệ thông tin" required />
                            </div>
                            <div>
                                <Label>Mô tả</Label>
                                <Input name="description" placeholder="Mô tả chức năng..." />
                            </div>
                            <Button type="submit" className="w-full">Lưu</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            }
        />
    );
}
