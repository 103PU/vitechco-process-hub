
import { getDepartments, createDepartment, deleteDepartment } from '@/app/actions/admin-departments';
import { AdminTable } from '@/components/admin/admin-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// -- Client Component wrapper for Actions --
import { DepartmentClientWrapper } from './client-wrapper';

export default async function DepartmentsPage() {
    const departments = await getDepartments();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Quản lý Phòng Ban (Cost Center)</h1>
            <DepartmentClientWrapper initialData={departments} />
        </div>
    );
}

