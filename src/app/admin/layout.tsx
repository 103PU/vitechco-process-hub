import Link from 'next/link';
import { FileText, Users, ArrowLeft, LayoutDashboard } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/features/auth/config/authOptions';
import NavLink from './NavLink';
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from '@/components/layout/MainLayout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== 'ADMIN') {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center p-8 bg-card rounded-lg shadow-md border border-border">
          <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You do not have the required permissions to access the admin area.</p>
          <Link href="/" className="mt-6 inline-block px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  const Sidebar = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-2 mb-6 text-xl font-bold border-b border-sidebar-border text-sidebar-primary">
        VINTECHCO ADMIN
      </div>
      <nav className="flex-1 space-y-2">
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
      <div className="mt-auto border-t border-sidebar-border pt-4">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <ArrowLeft size={20} />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );

  return (
    <MainLayout sidebar={Sidebar}>
      <header className="bg-card shadow-sm p-4 flex justify-end items-center mb-6 rounded-md border border-border">
        <AuthButton />
      </header>
      {children}
      <Toaster />
    </MainLayout>
  )
}