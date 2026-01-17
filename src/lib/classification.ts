import { PrismaClient, Department, DocumentType, DocumentTopic, Brand, MachineModel } from '@prisma/client';
import slugify from 'slugify';
import { AIClassificationService } from './ai-classification';
import { cleanAndExtractBrand, extractMetadataFromName, KNOWN_SERIES } from './utils/text-processing';

// Types for the result of classification
export interface ClassificationResult {
    department: Department;
    category: DocumentType; // Phân mục (Previously DocumentType)
    topic: DocumentTopic;   // Loại (New)
    brand?: Brand;
    models: MachineModel[]; // Changed from single model to array
    tags: string[];
    source: 'AI' | 'Regex' | 'Hybrid' | 'Heuristic';
}


export class ClassificationService {
    private prisma: PrismaClient;
    private aiService: AIClassificationService | null = null;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.aiService = new AIClassificationService(apiKey);
        } else {
            console.warn("AI Classification Disabled: GEMINI_API_KEY not found.");
        }
    }

    /**
     * Parse the path segments to identify or create entities following the 4-level hierarchy.
     * Expected Structure: [Department] / [Category] / [Topic] / [Brand] / [Model?]
     */
    async classifyFromSegments(pathSegments: string[], fileName: string, useAI: boolean = false): Promise<ClassificationResult> {
        if (pathSegments.length < 3) {
            throw new Error(`Invalid Path Structure. Too shallow. Expected at least: Dept/Category/Topic. Got: ${pathSegments.join('/')}`);
        }

        let [deptName, catName, topicName] = pathSegments;
        const brandNameCandidate = pathSegments.length > 3 ? pathSegments[3] : undefined;
        const modelNameCandidate = pathSegments.length > 4 ? pathSegments[4] : undefined;
        let extraTags = pathSegments.slice(5);

        let finalBrandName: string | undefined;
        let finalSeriesList: string[] = [];       // ALL Series for Model labels (can be multiple: MP, MPC, MPW)
        let finalModelTags: string[] = [];        // Specific models for Tags (MPC 3054, MPC 4054)
        let source: 'AI' | 'Regex' | 'Hybrid' | 'Heuristic' = 'Heuristic';

        // --- AI ENHANCEMENT ---
        if (useAI && this.aiService) {
            const aiResult = await this.aiService.analyzeFilename(fileName, pathSegments);
            if (aiResult) {
                source = 'AI';
                // If AI found better context, override or fill gaps
                if (aiResult.brand) finalBrandName = aiResult.brand;
                if (aiResult.models && aiResult.models.length > 0) {
                    // AI returns specific models, but we need series for Model label
                    finalModelTags = aiResult.models; // Keep specific models for tags
                }
                if (aiResult.tags) extraTags.push(...aiResult.tags);
                if (aiResult.category && !catName) catName = aiResult.category;
                if (aiResult.topic && !topicName) topicName = aiResult.topic;
            }
        }

        // --- FALLBACK / HYBRID VALIDATION ---

        // 1. Strict Brand Validation
        // If AI didn't return a brand, check folder name then filename
        if (!finalBrandName) {
            if (brandNameCandidate) {
                // Try to clean the folder name
                const cleaned = cleanAndExtractBrand(brandNameCandidate);
                if (cleaned) {
                    finalBrandName = cleaned;
                }
            }
            // Fallback: Check filename for brand if still not found
            if (!finalBrandName) {
                const fromFile = extractMetadataFromName(fileName);
                if (fromFile.brand) finalBrandName = fromFile.brand;
            }
        }

        // 2. ALWAYS extract Series & Models from filename (independent of brand source)
        // This ensures "MP7001-2 MPC 6502" always detects MP and MPC
        {
            const fromFile = extractMetadataFromName(fileName);
            if (fromFile.seriesList.length > 0) {
                finalSeriesList = fromFile.seriesList;
                if (source === 'Heuristic') source = 'Regex';
            }
            if (fromFile.models.length > 0) {
                finalModelTags = fromFile.models;
            }
        }

        // Add specific model numbers to tags (not to Model label)
        if (finalModelTags.length > 0) {
            extraTags.push(...finalModelTags);
        }

        // --- DB UPSERTS ---

        // 1. Department (Level 1)
        const department = await this.prisma.department.upsert({
            where: { name: deptName },
            update: {},
            create: { name: deptName }
        });

        // 2. Category / DocumentType (Level 2)
        const category = await this.prisma.documentType.upsert({
            where: { name: catName },
            update: {},
            create: { name: catName }
        });

        // 3. Topic (Level 3)
        // Slug must be globally unique, so include category
        const topicSlug = this.generateSlug(`${catName}-${topicName}`);
        let topic = await this.prisma.documentTopic.findFirst({
            where: { categoryId: category.id, slug: topicSlug }
        });

        if (!topic) {
            try {
                topic = await this.prisma.documentTopic.create({
                    data: { name: topicName, slug: topicSlug, categoryId: category.id }
                });
            } catch (e) {
                // Race condition: Topic created by another process
                topic = await this.prisma.documentTopic.findFirst({
                    where: { categoryId: category.id, slug: topicSlug }
                });
                if (!topic) throw e;
            }
        }

        let brand: Brand | undefined;
        const models: MachineModel[] = [];

        // 4. Attributes (Level 4): Brand & Models (SERIES ONLY)
        if (finalBrandName) {
            // Normalize: Try to clean again to ensure "TEST MÁY RICOH" -> "Ricoh"
            const cleaned = cleanAndExtractBrand(finalBrandName);
            if (cleaned) finalBrandName = cleaned;

            // Normalize case for DB lookup
            // We assume cleanAndExtractBrand returns a pretty string (e.g. "Ricoh")
            brand = await this.prisma.brand.upsert({
                where: { name: finalBrandName },
                update: {},
                create: { name: finalBrandName }
            });

            // Model label = ALL SERIES found in filename (MPC, MP, MPW - can be multiple)
            for (const seriesName of finalSeriesList) {
                // Name is globally unique, so find by name first
                let foundModel = await this.prisma.machineModel.findUnique({
                    where: { name: seriesName }
                });

                if (foundModel) {
                    // If found but doesn't have brand, might want to link it?
                    // But we won't force update brand if it might belong to another (though unlikely for MPC)
                    if (!foundModel.brandId && brand) {
                        try {
                            foundModel = await this.prisma.machineModel.update({
                                where: { id: foundModel.id },
                                data: { brandId: brand.id }
                            });
                        } catch (e) {
                            // Ignore race condition
                        }
                    }
                    models.push(foundModel);
                } else {
                    try {
                        const newModel = await this.prisma.machineModel.create({
                            data: { name: seriesName, brandId: brand.id }
                        });
                        models.push(newModel);
                    } catch (e) {
                        // Race condition handling
                        const retry = await this.prisma.machineModel.findUnique({ where: { name: seriesName } });
                        if (retry) models.push(retry);
                    }
                }
            }
        }

        // Deduplicate tags AND filter out Series Names found in tags
        // e.g. "MPC" should not be a tag if it is a Model/Series
        const seriesSet = new Set(KNOWN_SERIES.map(s => s.toUpperCase()));
        extraTags = Array.from(new Set(extraTags.filter(t => {
            if (!t || t.trim().length === 0) return false;
            // Check if tag is exact match to a known series (case insensitive)
            if (seriesSet.has(t.toUpperCase())) return false;
            return true;
        })));

        return {
            department,
            category,
            topic,
            brand,
            models,
            tags: extraTags,
            source
        };
    }







    private generateSlug(text: string): string {
        return slugify(text, { lower: true, strict: true, locale: 'vi' });
    }
}