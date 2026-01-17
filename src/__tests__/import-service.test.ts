/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportService } from '../lib/import/import-service';
import { PrismaClient } from '@prisma/client';
import { ClassificationService } from '../lib/classification';

// Mock everything
vi.mock('@prisma/client', () => {
    return {
        PrismaClient: class {
            fileAsset = { findUnique: vi.fn(), upsert: vi.fn() };
            document = { findFirst: vi.fn(), upsert: vi.fn() };
            tag = { upsert: vi.fn() };
            $transaction = vi.fn((callback) => callback(this));
            $disconnect = vi.fn();
        }
    };
});

vi.mock('../lib/classification', () => {
    return {
        ClassificationService: class {
            classifyFromSegments = vi.fn().mockResolvedValue({
                topic: { id: 'topic-1', name: 'Topic 1' },
                category: { id: 'cat-1', name: 'Cat 1' },
                department: { id: 'dept-1', name: 'Dept 1' },
                model: { id: 'model-1', name: 'Model 1' },
                tags: ['tag1']
            });
        }
    };
});

vi.mock('../lib/parsers/parser-factory', () => ({
    ParserFactory: {
        getParser: vi.fn().mockReturnValue({
            parse: vi.fn().mockResolvedValue({ content: 'Mock Parsed Content', metadata: {} })
        })
    }
}));


vi.mock('../lib/storage/s3', () => ({
    uploadFile: vi.fn().mockResolvedValue(true)
}));

vi.mock('fs', () => ({
    readFileSync: vi.fn().mockReturnValue(Buffer.from('mock content')),
    existsSync: vi.fn().mockReturnValue(true)
}));

describe('ImportService', () => {
    let service: ImportService;
    let mockPrisma: any;
    let mockClassifier: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        mockClassifier = new ClassificationService(mockPrisma);
        service = new ImportService(mockPrisma, mockClassifier);
    });

    it('should process a new file successfully', async () => {
        (mockPrisma.fileAsset.findUnique as any).mockResolvedValue(null); // New file
        (mockPrisma.document.findFirst as any).mockResolvedValue(null); // New doc

        const result = await service.processFile('/path/to/file.docx', ['Department', 'Category']);

        expect(result.status).toBe('success');
        expect(result.documentId).toBe('doc-1');
        expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should skip exact duplicate', async () => {
        (mockPrisma.fileAsset.findUnique as any).mockResolvedValue({ id: 'existing' });
        (mockPrisma.document.findFirst as any).mockResolvedValue({ id: 'existing-doc' });

        const result = await service.processFile('/path/to/file.docx', ['Department', 'Category']);

        expect(result.status).toBe('skipped');
    });
});
