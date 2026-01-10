/**
 * Input Validation Utilities
 * 
 * Provides comprehensive validation for user inputs to prevent XSS, injection attacks,
 * and other security vulnerabilities.
 */

import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'pre', 'code', 'blockquote', 'hr', 'div', 'span'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target'],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
}

/**
 * Sanitize filename to prevent path traversal
 * 
 * CRITICAL FIX: Process .. BEFORE / and \ to match test expectations
 */
export function sanitizeFilename(filename: string): string {
    // STEP 1: Replace .. with _.._  (MUST be first!)
    let safe = filename.replace(/\.\./g, '_.._');

    // STEP 2: Replace path separators
    safe = safe.replace(/[\/\\]/g, '_');

    // STEP 3: Remove dangerous characters (including *)
    safe = safe.replace(/[<>:"|?*\x00-\x1f]/g, '_');

    // STEP 4: Trim whitespace
    safe = safe.trim();

    // STEP 5: Ensure it doesn't start with a dot (hidden file)
    if (safe.startsWith('.')) {
        safe = 'file' + safe;
    }

    // STEP 6: Limit length while preserving extension
    if (safe.length > 255) {
        const lastDot = safe.lastIndexOf('.');
        if (lastDot > 0) {
            const ext = safe.slice(lastDot);
            const name = safe.slice(0, lastDot);
            safe = name.slice(0, 255 - ext.length) + ext;
        } else {
            safe = safe.slice(0, 255);
        }
    }

    return safe || 'unnamed_file';
}

/**
 * Validate and sanitize text input
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
    return text
        .trim()
        .slice(0, maxLength)
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, ''); // Remove javascript: protocol
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

/**
 * Validate CUID format (used by Prisma)
 * 
 * CUID format: 'c' + 23-24 alphanumeric characters = 24-25 total
 * Examples: 'ckl1234567890abcdefghijk' (24 chars)
 *          'cm1abcdefghijklmnopqrstuv' (25 chars)
 * 
 * CRITICAL FIX: Accept both 24 and 25 character CUIDs
 */
export function isValidCUID(id: string): boolean {
    // Match: starts with 'c', followed by 23-24 more chars (24-25 total)
    const cuidRegex = /^c[a-z0-9]{23,24}$/i;
    return cuidRegex.test(id);
}

/**
 * Validate email format
 */
export const emailSchema = z.string().email();

export function isValidEmail(email: string): boolean {
    return emailSchema.safeParse(email).success;
}

/**
 * Validate URL format
 */
export const urlSchema = z.string().url();

export function isValidUrl(url: string): boolean {
    return urlSchema.safeParse(url).success;
}

/**
 * Document creation/update schema
 */
export const documentSchema = z.object({
    title: z.string().min(1).max(500),
    content: z.string().max(1000000), // 1MB text limit
    documentTypeId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    departmentIds: z.array(z.string()).optional(),
    machineModelIds: z.array(z.string()).optional()
});

/**
 * User creation/update schema
 */
export const userSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    role: z.enum(['ADMIN', 'TECHNICIAN', 'VIEWER'])
});

/**
 * Checklist step schema
 */
export const stepSchema = z.object({
    name: z.string().min(1).max(500),
    description: z.string().max(5000).optional(),
    order: z.number().int().min(0),
    required: z.boolean().default(false)
});

/**
 * Search query schema
 */
export const searchSchema = z.object({
    q: z.string().max(500).optional(),
    tags: z.array(z.string()).optional(),
    brandId: z.string().optional(),
    modelId: z.string().optional(),
    departmentId: z.string().optional(),
    skip: z.number().int().min(0).default(0),
    take: z.number().int().min(1).max(100).default(20)
});

/**
 * Validate and sanitize search parameters
 */
export function validateSearchParams(params: unknown) {
    const result = searchSchema.safeParse(params);

    if (!result.success) {
        throw new Error(`Invalid search parameters: ${result.error.message}`);
    }

    // Sanitize query string
    if (result.data.q) {
        result.data.q = sanitizeText(result.data.q, 500);
    }

    return result.data;
}

/**
 * Rate limiting helper - check if too many requests
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    // No record or window expired - start fresh
    if (!record || now > record.resetAt) {
        const resetAt = now + windowMs;
        requestCounts.set(identifier, { count: 1, resetAt });
        return { allowed: true, remaining: maxRequests - 1, resetAt };
    }

    // Within window - check count
    if (record.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    // Increment count
    record.count++;
    return {
        allowed: true,
        remaining: maxRequests - record.count,
        resetAt: record.resetAt
    };
}

/**
 * Clean up old rate limit records periodically
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
        if (now > record.resetAt) {
            requestCounts.delete(key);
        }
    }
}, 60000); // Clean up every minute
