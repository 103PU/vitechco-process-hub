'use server';

import { ParserFactory } from '@/lib/parsers/parser-factory';
import { withRole, Role } from '@/lib/auth/rbac';

export const parseDocumentAction = withRole([Role.ADMIN, Role.TECHNICIAN], async (formData: FormData) => {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    // Basic file size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return { success: false, error: 'File size exceeds 10MB limit' };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type;
        const fileName = file.name;

        const parser = ParserFactory.getParser(mimeType);

        if (!parser) {
            return {
                success: false,
                error: `Unsupported file type: ${mimeType}. Supported types: DOCX, Excel, PDF.`
            };
        }

        const result = await parser.parse(buffer, fileName, mimeType);

        return {
            success: true,
            html: result.content,
            metadata: result.metadata
        };

    } catch (error: any) {
        console.error('Parse Error:', error);
        return { success: false, error: 'Failed to parse document: ' + error.message };
    }
});
