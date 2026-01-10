'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { LogIn, LogOut, LayoutDashboard } from 'lucide-react';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>;
  }

  if (session) {
    const userRole = (session.user as { role?: string } | undefined)?.role;
    return (
      <div className="flex items-center gap-4">
        {userRole === 'ADMIN' && (
            <Link href="/admin" className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                <LayoutDashboard size={16} />
                <span>Admin</span>
            </Link>
        )}
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || 'User avatar'}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
    >
      <LogIn size={16} />
      Đăng nhập
    </button>
  );
}
