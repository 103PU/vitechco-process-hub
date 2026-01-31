'use client';

import Link from 'next/link';
import { Menu, Cpu, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { SearchForm } from '@/components/SearchForm';
import AuthButton from '@/components/AuthButton';
import { useState, Suspense } from 'react';

export function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

                {/* LEFT: Mobile Menu & Logo */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Mobile Trigger */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-gray-600">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                            <SheetHeader className="p-6 border-b bg-gray-50/50">
                                <SheetTitle className="flex items-center gap-2 text-primary">
                                    <Cpu className="h-6 w-6" />
                                    VINTECHCO Hub
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col py-6 px-4 gap-6 h-full">
                                {/* Mobile Search */}
                                <div className="w-full">
                                    <div className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Tìm kiếm</div>
                                    <Suspense fallback={<div className="h-10 w-full bg-gray-100 rounded-full animate-pulse" />}>
                                        <SearchForm />
                                    </Suspense>
                                </div>

                                {/* Mobile Nav Links */}
                                <nav className="flex flex-col gap-2">
                                    <div className="mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">Menu</div>
                                    <Link
                                        href="/"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
                                    >
                                        <Home className="h-5 w-5" />
                                        Trang chủ
                                    </Link>
                                    {/* Admin link handled within AuthButton logic or we can duplicate check here if needed */}
                                </nav>

                                {/* Mobile Auth (Bottom) */}
                                <div className="mt-auto border-t pt-6">
                                    <AuthButton />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Cpu className="h-8 w-8 text-blue-600" />
                        <span className="hidden lg:inline-block font-bold text-xl text-gray-900 tracking-tight">VINTECHCO Hub</span>
                    </Link>
                </div>

                {/* CENTER: Search (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-xl mx-auto">
                    <Suspense fallback={<div className="h-10 w-full bg-gray-100 rounded-full animate-pulse" />}>
                        <SearchForm />
                    </Suspense>
                </div>

                {/* RIGHT: Auth (Desktop) */}
                <div className="hidden md:flex items-center">
                    <AuthButton />
                </div>

                {/* Mobile Search Icon Trigger (Optional - if we want search strictly in menu or expand on click) */}
                {/* For now, just keeping the layout clean. Mobile Search is in the Sidebar. */}
                <div className="md:hidden flex items-center">
                    {/* Use AuthButton here too? The user said 'nhồi nhét'. 
                 Maybe just show Avatar if logged in? 
                 For simplicity, let's put EVERYTHING in the Sidebar for mobile 
                 to solve the 'cluttered' issue completely.
             */}
                </div>

            </div>
        </header>
    );
}
