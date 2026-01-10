'use client';

import { createBrand, deleteBrand } from '@/app/actions/admin-taxonomy';
import { AdminTable } from '@/components/admin/admin-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function BrandClientWrapper({ initialData }: { initialData: any[] }) {
    const [open, setOpen] = useState(false);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Tên Thương Hiệu",
        },
        {
            accessorKey: "_count.machineModels",
            header: "Số dòng máy",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={async () => {
                            if (confirm(`Xóa thương hiệu ${item.name}?`)) {
                                const res = await deleteBrand(item.id);
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
        const res = await createBrand(formData);
        if (res.success) {
            toast.success("Đã tạo mới");
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
                            <DialogTitle>Thêm Thương Hiệu</DialogTitle>
                        </DialogHeader>
                        <form action={handleSubmit} className="space-y-4 py-4">
                            <div>
                                <Label>Tên Thương Hiệu</Label>
                                <Input name="name" placeholder="Vd: Ricoh, Toshiba" required />
                            </div>
                            <Button type="submit" className="w-full">Lưu</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            }
        />
    );
}
