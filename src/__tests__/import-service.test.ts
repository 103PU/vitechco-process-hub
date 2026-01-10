
import { ImportService } from '../lib/import/import-service';
import { PrismaClient } from '@prisma/client';
import { ClassificationService } from '../lib/classification';

// Mock everything
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        fileAsset: { findUnique: jest.fn(), upsert: jest.fn() },
        document: { findFirst: jest.fn(), upsert: jest.fn() },
        tag: { upsert: jest.fn() },
        $transaction: jest.fn((callback) => callback({
            fileAsset: { upsert: jest.fn().mockResolvedValue({ id: 'asset-1' }) },
            tag: { upsert: jest.fn() },
            document: { upsert: jest.fn().mockResolvedValue({ id: 'doc-1' }) }
        })),
        $disconnect: jest.fn()
    }))
}));

jest.mock('../lib/classification', () => ({
    ClassificationService: jest.fn().mockImplementation(() => ({
        classifyFromSegments: jest.fn().mockResolvedValue({
            topic: { id: 'topic-1', name: 'Topic 1' },
            category: { id: 'cat-1', name: 'Cat 1' },
            department: { id: 'dept-1', name: 'Dept 1' },
            model: { id: 'model-1', name: 'Model 1' },
            tags: ['tag1']
        })
    }))
}));

jest.mock('../lib/parsers/parser-factory', () => ({
    ParserFactory: {
        getParser: jest.fn().mockReturnValue({
            parse: jest.fn().mockResolvedValue({ content: 'Mock Parsed Content', metadata: {} })
        })
    }
}));


jest.mock('../lib/storage/s3', () => ({
    uploadFile: jest.fn().mockResolvedValue(true)
}));

jest.mock('fs', () => ({
    readFileSync: jest.fn().mockReturnValue(Buffer.from('mock content')),
    existsSync: jest.fn().mockReturnValue(true)
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
        (mockPrisma.fileAsset.findUnique as jest.Mock).mockResolvedValue(null); // New file
        (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(null); // New doc

        const result = await service.processFile('/path/to/file.docx', ['Department', 'Category']);

        expect(result.status).toBe('success');
        expect(result.documentId).toBe('doc-1');
        expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should skip exact duplicate', async () => {
        (mockPrisma.fileAsset.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });
        (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-doc' });

        const result = await service.processFile('/path/to/file.docx', ['Department', 'Category']);

        expect(result.status).toBe('skipped');
    });
});
