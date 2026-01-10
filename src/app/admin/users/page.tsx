import { UserService } from '@/features/users/services/UserService';
import { columns } from '@/features/users/components/table/columns';
import { DataTable } from '@/features/users/components/table/data-table';

async function getUsers() {
    const users = await UserService.getAll();
    type User = Awaited<ReturnType<typeof UserService.getAll>>[number];
    return users.map((user: User) => ({
        id: user.id,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        image: user.image,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
    }));
}

export default async function AdminUsersPage() {
    const data = await getUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Nhân sự hệ thống</h1>
                <p className="mt-1 text-gray-500">
                    Cấp quyền, quản lý vai trò và tài khoản của các kỹ thuật viên.
                </p>
            </div>
            <DataTable columns={columns} data={data} />
        </div>
    )
}