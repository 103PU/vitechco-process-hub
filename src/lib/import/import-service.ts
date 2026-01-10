
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { ParserFactory } from '../parsers/parser-factory';
import { ClassificationService } from '../classification';
import { uploadFile } from '../storage/s3';
import slugify from 'slugify';

// Define return type
export interface ImportResult {
    status: 'skipped' | 'success' | 'error';
    documentId?: string;
    message?: string;
    classification?: any; // Avoiding circular dependency complexity for now
}

export class ImportService {
    constructor(
        private prisma: PrismaClient,
        private classifier: ClassificationService
    ) { }

    async processFile(
        filePath: string,
        pathStack: string[],
        buffer?: Buffer,
        mode: 'fast' | 'full' = 'full'
    ): Promise<ImportResult> {
        const fileName = path.basename(filePath);
        const fileContent = buffer || fs.readFileSync(filePath);

        // 1. Deduplication (Search by Hash)
        const hash = crypto.createHash('sha256').update(fileContent).digest('hex');

        // Check if file asset specifically exists
        const existingAsset = await this.prisma.fileAsset.findUnique({
            where: { hash }
        });

        // 2. Classification
        let classification;
        try {
            const useAI = mode === 'full';
            classification = await this.classifier.classifyFromSegments(pathStack, fileName, useAI);
        } catch (err: any) {
            return { status: 'error', message: `Classification failed: ${err.message}` };
        }

        const title = this.cleanName(fileName.replace(path.extname(fileName), ''));

        // Check if document exists in this topic to prevent logical duplicates even if file is new
        // or if file is duplicate but linked to different place (which we might want to allow? but for now let's be strict)
        const existingDoc = await this.prisma.document.findFirst({
            where: {
                title,
                topicId: classification.topic.id
            }
        });

        if (existingDoc && existingAsset) {
            return { status: 'skipped', message: 'Exact duplicate found (File + Metadata)' };
        }

        // 3. Parse Content
        const mimeType = this.getMimeType(filePath);
        const parser = ParserFactory.getParser(mimeType);
        let parsedContent = { content: `File: ${fileName}`, metadata: {} };

        if (parser) {
            try {
                parsedContent = await parser.parse(fileContent, fileName, mimeType);
            } catch (e) {
                console.warn(`Parser failed for ${fileName}, falling back to default.`);
            }
        }

        // 4. Upload to S3 (if new asset)
        let storagePath = existingAsset?.storagePath;
        let bucket = existingAsset?.bucket || process.env.S3_BUCKET || 'vitechco-assets';

        if (!existingAsset) {
            const key = `import/${Date.now()}-${slugify(fileName, { lower: true })}`;
            await uploadFile(key, fileContent, mimeType);
            storagePath = key;
        }

        // 5. Transactional Save
        try {
            const doc = await this.prisma.$transaction(async (tx) => {
                // Upsert Asset
                const asset = await tx.fileAsset.upsert({
                    where: { hash },
                    update: {},
                    create: {
                        originalName: fileName,
                        mime: mimeType,
                        size: fileContent.length,
                        hash: hash,
                        storagePath: storagePath!,
                        bucket: bucket
                    }
                });

                // Upsert Tags
                const mappedTags = [];
                for (const t of classification.tags) {
                    await tx.tag.upsert({ where: { name: t }, update: {}, create: { name: t } });
                    mappedTags.push(t);
                }

                // Upsert Document
                const newDoc = await tx.document.upsert({
                    where: { id: existingDoc?.id || "new-id-placeholder" },
                    update: {}, // In future we might want to update content if file changed but title/topic same? 
                    // But here we rely on hash check above.
                    create: {
                        title,
                        content: parsedContent.content || '',
                        originalFilePath: filePath,
                        updatedAt: new Date(),
                        documentTypeId: classification.category.id,
                        topicId: classification.topic.id,
                        machineModels: {
                            create: classification.models.map(m => ({
                                machineModel: { connect: { id: m.id } }
                            }))
                        },
                        departments: {
                            create: { department: { connect: { id: classification.department.id } } }
                        },
                        tags: {
                            create: mappedTags.map(t => ({ tag: { connect: { name: t } } }))
                        },
                        versions: {
                            create: {
                                version: 1,
                                title: title,
                                content: parsedContent.content || '',
                                fileAssetId: asset.id,
                                authorId: 'system' // TODO: Pass in author ID
                            }
                        },
                        fileAssets: {
                            connect: { id: asset.id }
                        }
                    }
                });

                return newDoc;
            }, {
                maxWait: 5000,
                timeout: 30000 // Increased to 30s
            });

            return { status: 'success', documentId: doc.id, classification: classification };

        } catch (err: any) {
            return { status: 'error', message: `DB Transaction failed: ${err.message}` };
        }
    }

    // Helpers
    private cleanName(name: string): string {
        return name.replace(/^\d+\.\s*/, '').trim();
    }

    private getMimeType(filePath: string): string {
        // Simple mapping, rely on extension or mime package if needed
        const ext = path.extname(filePath).toLowerCase();
        const map: any = {
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.pdf': 'application/pdf'
        };
        return map[ext] || 'application/octet-stream';
    }
}
