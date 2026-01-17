
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { ParserFactory } from '../parsers/parser-factory';
import { ClassificationService } from '../classification';
import { uploadFile } from '../storage/s3';
import slugify from 'slugify';

import { ClassificationResult } from '../classification';

// Define return type
export interface ImportResult {
    status: 'skipped' | 'success' | 'error';
    documentId?: string;
    message?: string;
    classification?: ClassificationResult;
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
        let classification: ClassificationResult;
        try {
            const useAI = mode === 'full';
            classification = await this.classifier.classifyFromSegments(pathStack, fileName, useAI);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            return { status: 'error', message: `Classification failed: ${errorMessage}` };
        }

        const title = this.cleanName(fileName.replace(path.extname(fileName), ''));

        // Check if document exists in this topic to prevent logical duplicates even if file is new
        // or if file is duplicate but linked to different place (which we might want to allow? but for now let's be strict)
        const existingDoc = await this.prisma.document.findFirst({
            where: {
                title,
                technicalMetadata: {
                    topicId: classification.topic.id
                }
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
            } catch {
                console.warn(`Parser failed for ${fileName}, falling back to default.`);
            }
        }

        // 4. Upload to S3 (if new asset)
        let storagePath = existingAsset?.storagePath;
        const bucket = existingAsset?.bucket || process.env.S3_BUCKET || 'vitechco-assets';

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
                const systemAuthId = await this.getSystemUser();

                // Upsert Document (Core)
                const doc = await tx.document.upsert({
                    where: { id: existingDoc?.id || "new-id-placeholder" }, // Prisma handles new-id-placeholder gracefully? No, logic is: if existing, update, else create
                    update: {
                        title: title,
                        content: parsedContent.content || '',
                        updatedAt: new Date(),
                    },
                    create: {
                        title: title,
                        content: parsedContent.content || '',
                        originalFilePath: filePath,
                        updatedAt: new Date(),
                        departments: {
                            create: { department: { connect: { id: classification.department.id } } }
                        },
                        versions: {
                            create: {
                                version: 1,
                                title: title,
                                content: parsedContent.content || '',
                                fileAssetId: asset.id,
                                authorId: systemAuthId
                            }
                        },
                        fileAssets: {
                            connect: { id: asset.id }
                        }
                    }
                });

                // Upsert Technical Metadata (Extension)
                await tx.technicalMetadata.upsert({
                    where: { documentId: doc.id },
                    update: {
                        documentTypeId: classification.category.id,
                        topicId: classification.topic.id,
                        // Update relations? For import we might want to overwrite or merge.
                        // For simplicity, let's just update Type/Topic. Relations are harder in upsert 'update'.
                    },
                    create: {
                        documentId: doc.id,
                        documentTypeId: classification.category.id,
                        topicId: classification.topic.id,
                        machineModels: {
                            create: classification.models.map(m => ({
                                machineModel: { connect: { id: m.id } }
                            }))
                        },
                        tags: {
                            create: mappedTags.map(t => ({ tag: { connect: { name: t } } }))
                        }
                    }
                });

                // Re-sync relations if it was an update (since the above create only runs on insert)
                // If it's an update, 'create' in TechnicalMetadata didn't run.
                // We need to ensure tags/models are updated.
                // For simplicity in this script, we can do deleteMany/createMany for relations on metadata
                // But we need the Metadata ID.
                const meta = await tx.technicalMetadata.findUniqueOrThrow({ where: { documentId: doc.id } });

                // Sync Machine Models
                await tx.documentOnMachineModel.deleteMany({ where: { technicalMetadataId: meta.id } });
                if (classification.models.length > 0) {
                    await tx.documentOnMachineModel.createMany({
                        data: classification.models.map(m => ({
                            technicalMetadataId: meta.id,
                            machineModelId: m.id
                        }))
                    });
                }

                // Sync Tags
                await tx.documentOnTag.deleteMany({ where: { technicalMetadataId: meta.id } });
                if (mappedTags.length > 0) {
                    // We need Tag IDs for createMany
                    // mappedTags are names. We upserted them earlier but didn't cache IDs.
                    // The loop lines 111-114 upserted them.
                    const tagObjs = await tx.tag.findMany({ where: { name: { in: mappedTags } } });

                    await tx.documentOnTag.createMany({
                        data: tagObjs.map(t => ({
                            technicalMetadataId: meta.id,
                            tagId: t.id
                        }))
                    });
                }

                return doc;
            }, {
                maxWait: 5000,
                timeout: 30000
            });

            return { status: 'success', documentId: doc.id, classification: classification };

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            return { status: 'error', message: `DB Transaction failed: ${errorMessage}` };
        }
    }

    private async getSystemUser(): Promise<string> {
        // Try to find an existing system user or the first admin
        const systemUser = await this.prisma.user.findFirst({
            where: { email: 'system@vitechco.com' }
        });
        if (systemUser) return systemUser.id;

        // Fallback: Find ANY admin to be the author
        const admin = await this.prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (admin) return admin.id;

        // Fallback: Create a System User if totally empty
        const newUser = await this.prisma.user.create({
            data: {
                name: 'System Import',
                email: 'system@vitechco.com',
                role: 'ADMIN',
                createdAt: new Date(),
            }
        });
        return newUser.id;
    }

    // Helpers
    private cleanName(name: string): string {
        return name.replace(/^\d+\.\s*/, '').trim();
    }

    private getMimeType(filePath: string): string {
        // Simple mapping, rely on extension or mime package if needed
        const ext = path.extname(filePath).toLowerCase();
        const map: Record<string, string> = {
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.pdf': 'application/pdf'
        };
        return map[ext] || 'application/octet-stream';
    }
}
