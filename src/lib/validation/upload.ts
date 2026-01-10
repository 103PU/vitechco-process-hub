/**
 * File Upload Validation
 * 
 * Validates uploaded files for security: MIME type, size, magic bytes verification.
 */

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_MIME_TYPES = {
    // Documents
    'application/pdf': { ext: '.pdf', magicBytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
    'application/msword': { ext: '.doc', magicBytes: [0xD0, 0xCF, 0x11, 0xE0] }, // DOC
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        ext: '.docx',
        magicBytes: [0x50, 0x4B, 0x03, 0x04] // DOCX (ZIP format)
    },

    // Spreadsheets
    'application/vnd.ms-excel': { ext: '.xls', magicBytes: [0xD0, 0xCF, 0x11, 0xE0] },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        ext: '.xlsx',
        magicBytes: [0x50, 0x4B, 0x03, 0x04]
    },

    // Text
    'text/plain': { ext: '.txt', magicBytes: null }, // No magic bytes for text
    'text/markdown': { ext: '.md', magicBytes: null },

    // Images (for embedded content)
    'image/jpeg': { ext: '.jpg', magicBytes: [0xFF, 0xD8, 0xFF] },
    'image/png': { ext: '.png', magicBytes: [0x89, 0x50, 0x4E, 0x47] },
    'image/webp': { ext: '.webp', magicBytes: [0x52, 0x49, 0x46, 0x46] }
} as const;

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * File validation error
 */
export class FileValidationError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'FileValidationError';
    }
}

/**
 * Verify magic bytes match the expected MIME type
 */
function verifyMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean {
    const typeInfo = ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES];

    if (!typeInfo) return false;
    if (!typeInfo.magicBytes) return true; // No magic bytes to check (text files)

    const bytes = new Uint8Array(buffer);
    const magicBytes = typeInfo.magicBytes;

    // Check if file starts with expected magic bytes
    for (let i = 0; i < magicBytes.length; i++) {
        if (bytes[i] !== magicBytes[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Sanitize filename to prevent path traversal and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
    // Remove path separators
    let safe = filename.replace(/[\/\\]/g, '_');

    // Remove parent directory references
    safe = safe.replace(/\.\./g, '_');

    // Remove dangerous characters
    safe = safe.replace(/[<>:"|?*\x00-\x1f]/g, '_');

    // Trim whitespace
    safe = safe.trim();

    // Ensure it doesn't start with a dot (hidden file)
    if (safe.startsWith('.')) {
        safe = 'file' + safe;
    }

    // Limit length (most filesystems support 255 chars)
    if (safe.length > 255) {
        const ext = safe.slice(safe.lastIndexOf('.'));
        safe = safe.slice(0, 255 - ext.length) + ext;
    }

    return safe || 'unnamed_file';
}

/**
 * Generate safe unique filename
 */
export function generateSafeFilename(originalName: string, userId: string): string {
    const sanitized = sanitizeFilename(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    const nameWithoutExt = sanitized.slice(0, sanitized.lastIndexOf('.'));

    return `${userId}_${timestamp}_${random}_${nameWithoutExt}${ext}`;
}

/**
 * Validate uploaded file
 */
export async function validateUpload(file: File): Promise<{
    isValid: boolean;
    safeName: string;
    error?: string;
}> {
    try {
        // 1. Check if MIME type is allowed
        if (!(file.type in ALLOWED_MIME_TYPES)) {
            throw new FileValidationError(
                `File type not allowed: ${file.type}. Allowed types: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
                'INVALID_MIME_TYPE'
            );
        }

        // 2. Check file size
        if (file.size > MAX_FILE_SIZE) {
            throw new FileValidationError(
                `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                'FILE_TOO_LARGE'
            );
        }

        // 3. Check if file is empty
        if (file.size === 0) {
            throw new FileValidationError(
                'File is empty',
                'EMPTY_FILE'
            );
        }

        // 4. Verify magic bytes (first 4 bytes)
        const buffer = await file.arrayBuffer();
        if (!verifyMagicBytes(buffer, file.type)) {
            throw new FileValidationError(
                'File content does not match declared MIME type',
                'MIME_MISMATCH'
            );
        }

        // 5. Sanitize filename
        const safeName = sanitizeFilename(file.name);

        return {
            isValid: true,
            safeName
        };

    } catch (error) {
        if (error instanceof FileValidationError) {
            return {
                isValid: false,
                safeName: '',
                error: error.message
            };
        }

        return {
            isValid: false,
            safeName: '',
            error: 'Unknown validation error'
        };
    }
}

/**
 * Validate multiple files
 */
export async function validateMultipleUploads(files: File[]): Promise<{
    valid: File[];
    invalid: Array<{ file: File; error: string }>;
}> {
    const results = await Promise.all(
        files.map(async (file) => ({
            file,
            validation: await validateUpload(file)
        }))
    );

    const valid = results
        .filter(r => r.validation.isValid)
        .map(r => r.file);

    const invalid = results
        .filter(r => !r.validation.isValid)
        .map(r => ({
            file: r.file,
            error: r.validation.error || 'Unknown error'
        }));

    return { valid, invalid };
}

/**
 * Calculate file hash for deduplication
 */
export async function calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
