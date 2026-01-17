/**
 * Vietnamese Text Normalization Utilities
 * 
 * Handles Vietnamese diacritics removal for better search compatibility
 * with SQLite which doesn't support Vietnamese full-text search well.
 */

/**
 * Map of Vietnamese characters with diacritics to their base forms
 */
const vietnameseMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    // Uppercase
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'Đ': 'D',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
};

/**
 * Remove Vietnamese diacritics from text
 * @param text - Input text with Vietnamese diacritics
 * @returns Text with diacritics removed
 * 
 * @example
 * normalizeVietnamese("Máy photocopy Ricoh") // "May photocopy Ricoh"
 * normalizeVietnamese("Hướng dẫn sử dụng") // "Huong dan su dung"
 */
export function normalizeVietnamese(text: string): string {
    if (!text) return '';

    let result = text;

    // Replace each Vietnamese character with its base form
    for (const [vietnameseChar, baseChar] of Object.entries(vietnameseMap)) {
        result = result.replace(new RegExp(vietnameseChar, 'g'), baseChar);
    }

    return result.toLowerCase();
}

/**
 * Check if two Vietnamese strings are equal after normalization
 * @param str1 - First string
 * @param str2 - Second string
 * @param caseSensitive - Whether comparison should be case sensitive
 * @returns True if strings are equal after normalization
 * 
 * @example
 * compareVietnamese("Máy", "May") // true
 * compareVietnamese("Ricoh", "ricoh") // true (default case-insensitive)
 */
export function compareVietnamese(
    str1: string,
    str2: string,
    caseSensitive = false
): boolean {
    const norm1 = normalizeVietnamese(str1);
    const norm2 = normalizeVietnamese(str2);

    if (caseSensitive) {
        return norm1 === norm2;
    }

    return norm1.toLowerCase() === norm2.toLowerCase();
}

/**
 * Check if text contains a Vietnamese search query (normalized)
 * @param text - Text to search in
 * @param query - Search query
 * @returns True if text contains query after normalization
 * 
 * @example
 * containsVietnamese("Máy photocopy Ricoh", "may") // true
 * containsVietnamese("Hướng dẫn", "huong dan") // true
 */
export function containsVietnamese(text: string, query: string): boolean {
    const normText = normalizeVietnamese(text).toLowerCase();
    const normQuery = normalizeVietnamese(query).toLowerCase();

    return normText.includes(normQuery);
}

/**
 * Normalize search query for database comparison
 * Useful for preparing search terms before sending to API
 * 
 * @param query - User's search query
 * @returns Normalized query ready for comparison
 * 
 * @example
 * normalizeSearchQuery("Máy photocopy") // "may photocopy"
 */
export function normalizeSearchQuery(query: string): string {
    return normalizeVietnamese(query).toLowerCase().trim();
}

/**
 * Remove all Vietnamese accents from text
 * Public export for testing and external use
 */
export function removeAccents(text: string): string {
    return normalizeVietnamese(text);
}
