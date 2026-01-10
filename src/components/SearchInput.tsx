'use client';

import { Search, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    isLoading?: boolean;
    placeholder?: string;
    className?: string;
}

export function SearchInput({
    value,
    onChange,
    onClear,
    isLoading = false,
    placeholder = 'Tìm kiếm tài liệu...',
    className = '',
}: SearchInputProps) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>

            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-20"
            />

            <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                {isLoading && (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                )}

                {value && !isLoading && onClear && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="h-7 w-7 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
