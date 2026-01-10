import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pre-defined vibrant palette for tags to avoid muddy grays
const TAG_PALETTE = [
    { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' }, // Sky Blue
    { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }, // Green
    { bg: '#fef3c7', text: '#b45309', border: '#fde68a' }, // Amber
    { bg: '#fae8ff', text: '#7e22ce', border: '#f0abfc' }, // Purple
    { bg: '#fce7f3', text: '#be185d', border: '#fbcfe8' }, // Pink
    { bg: '#ffe4e6', text: '#be123c', border: '#fda4af' }, // Rose
    { bg: '#ccfbf1', text: '#0f766e', border: '#99f6e4' }, // Teal
    { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' }, // Orange
    { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' }, // Indigo
    { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }, // Gray (backup)
];

export const getTagColors = (str: string) => {
    if (!str) return TAG_PALETTE[9]; // Return gray if empty
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use modulo to pick a color from the palette deterministically
    const index = Math.abs(hash) % (TAG_PALETTE.length - 1); // Exclude the last gray one for random selection
    return TAG_PALETTE[index];
};

// Deprecated functions kept for compatibility just in case, but redirected
export const getBgColorForString = (str: string) => getTagColors(str).bg;
export const getTextColorForString = (str: string) => getTagColors(str).text;