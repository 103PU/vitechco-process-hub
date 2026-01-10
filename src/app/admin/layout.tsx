import Link from 'next/link';
import { Home, FileText, Users, LogOut, ArrowLeft, LayoutDashboard } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth/config/authOptions';
import NavLink from './NavLink';
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== 'ADMIN') {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
                <p className="mt-2 text-gray-700">You do not have the required permissions to access the admin area.</p>
                <Link href="/" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Go to Homepage
                </Link>
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-700">
          VITECHCO ADMIN
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavLink href="/admin">
            <LayoutDashboard size={20} />
            <span>Tổng quan</span>
          </NavLink>
          <NavLink href="/admin/documents">
            <FileText size={20} />
            <span>Dữ liệu</span>
          </NavLink>
          <NavLink href="/admin/users">
            <Users size={20} />
            <span>Người dùng</span>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-700">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
                <ArrowLeft size={20} />
                <span>Về trang chủ</span>
            </Link>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
            <AuthButton />
        </header>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
        <Toaster />
      </main>
    </div>
  )
}