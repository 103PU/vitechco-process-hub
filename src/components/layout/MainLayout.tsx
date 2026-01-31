'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MainLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    outline?: React.ReactNode;
    className?: string;
}

export function MainLayout({
    children,
    sidebar,
    outline,
    className
}: MainLayoutProps) {
    return (
        <div className={cn("flex min-h-screen w-full bg-background", className)}>
            {/* Left Sidebar - 4-Level Ops Tree */}
            {sidebar && (
                <aside className="hidden border-r bg-sidebar md:block w-64 lg:w-72 sticky top-0 h-screen shrink-0">
                    <ScrollArea className="h-full">
                        <div className="p-4">
                            {sidebar}
                        </div>
                    </ScrollArea>
                </aside>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <ScrollArea className="flex-1">
                    <div className="container max-w-5xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </ScrollArea>
            </main>

            {/* Right Sidebar - Table of Contents (Outline) */}
            {outline && (
                <aside className="hidden xl:block w-64 border-l bg-sidebar/50 sticky top-0 h-screen shrink-0">
                    <ScrollArea className="h-full">
                        <div className="p-4">
                            <h4 className="mb-4 text-sm font-semibold leading-none text-muted-foreground uppercase tracking-wider">
                                Mục Lục
                            </h4>
                            {outline}
                        </div>
                    </ScrollArea>
                </aside>
            )}
        </div>
    );
}
