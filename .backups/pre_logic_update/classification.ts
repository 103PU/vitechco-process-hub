import { PrismaClient, Department, DocumentType, DocumentTopic, Brand, MachineModel } from '@prisma/client';
import slugify from 'slugify';
import { AIClassificationService } from './ai-classification';

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

// ============================================================================
// BRAND & MODEL SANITATION CONSTANTS
// ============================================================================

/** Canonical brand names (whitelist) */
const KNOWN_BRANDS: { [key: string]: string } = {
    'RICOH': 'Ricoh',
    'TOSHIBA': 'Toshiba',
    'CANON': 'Canon',
    'SHARP': 'Sharp',
    'HP': 'HP',
    'XEROX': 'Xerox',
    'KONICA': 'Konica Minolta',
    'KONICA MINOLTA': 'Konica Minolta',
    'KYOCERA': 'Kyocera',
    'SAMSUNG': 'Samsung',
    'BROTHER': 'Brother',
    'EPSON': 'Epson',
    'PANASONIC': 'Panasonic',
};

/** Junk keywords to remove before brand extraction */
const JUNK_KEYWORDS = ['TEST', 'MÁY', 'COPY', 'SCAN', 'OFFICE', 'A4', 'A3', 'NEW', 'OLD', 'PRINTER', 'FAX', 'MÀU', 'ĐEN', 'TRẮNG'];

/**
 * Cleans a raw string and extracts a canonical brand name.
 * @returns Canonical brand name or null if not found.
 */
export function cleanAndExtractBrand(rawName: string): string | null {
    if (!rawName) return null;

    // 1. Normalize: Uppercase
    let cleaned = rawName.toUpperCase();

    // 2. Remove junk keywords
    for (const junk of JUNK_KEYWORDS) {
        cleaned = cleaned.replace(new RegExp(`\\b${junk}\\b`, 'gi'), '');
    }
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // 3. Match against whitelist
    for (const key of Object.keys(KNOWN_BRANDS)) {
        if (cleaned.includes(key)) {
            return KNOWN_BRANDS[key];
        }
    }

    // 4. Infer brand from series prefix
    const seriesBrandMap: { [key: string]: string } = {
        'MPC': 'Ricoh', 'MP': 'Ricoh', 'SP': 'Ricoh', 'IM': 'Ricoh', 'AFICIO': 'Ricoh',
        'E-STUDIO': 'Toshiba', 'ESTUDIO': 'Toshiba',
        'IR-ADV': 'Canon', 'IRADV': 'Canon', 'IR': 'Canon',
    };
    for (const series of Object.keys(seriesBrandMap)) {
        if (cleaned.includes(series)) {
            return seriesBrandMap[series];
        }
    }

    // 5. Fallback: Check if remaining string looks like a valid brand (no special chars)
    if (/^[a-zA-Z0-9 ]{2,30}$/.test(cleaned) && cleaned.length > 1) {
        // Still not in whitelist, return null to trigger UNKNOWN assignment
        return null;
    }

    return null;
}

/**
 * Extracts series prefix and specific model numbers from a filename.
 * 
 * @returns { series: string | null, models: string[] }
 *   - series: The machine type/series (e.g., "MPC", "MP", "e-Studio") for Model label
 *   - models: Array of specific model numbers (e.g., ["MPC 3054", "MPC 4054"]) for Tags
 * 
 * Example: "MPC 3054-4054-5054" => { series: "MPC", models: ["MPC 3054", "MPC 4054", "MPC 5054"] }
 */
export function extractSeriesAndModels(rawName: string): { series: string | null, models: string[] } {
    if (!rawName) return { series: null, models: [] };

    // Known series prefixes (must be followed by digits to be recognized)
    const prefixPatterns = [
        { pattern: /\b(MPC)\s*(\d[\d\s\-\/,&]*)/i, series: 'MPC' },        // Ricoh Color
        { pattern: /\b(MPW)\s*(\d[\d\s\-\/,&]*)/i, series: 'MPW' },        // Ricoh Wide
        { pattern: /\b(MP)\s*(\d[\d\s\-\/,&]*)/i, series: 'MP' },          // Ricoh B/W
        { pattern: /\b(SP)\s*(\d[\d\s\-\/,&]*)/i, series: 'SP' },          // Ricoh Small
        { pattern: /\b(IM)\s*(\d[\d\s\-\/,&]*)/i, series: 'IM' },          // Ricoh IM Series
        { pattern: /\b(Pro\s*C)\s*(\d[\d\s\-\/,&]*)/i, series: 'Pro C' },  // Ricoh Production Color
        { pattern: /\b(e-?Studio)\s*(\d[\d\s\-\/,&]*)/i, series: 'e-Studio' }, // Toshiba
        { pattern: /\b(iR-?ADV)\s*(\d[\d\s\-\/,&]*)/i, series: 'iR-ADV' }, // Canon Advanced
        { pattern: /\b(iR)\s*(\d[\d\s\-\/,&]*)/i, series: 'iR' },          // Canon
    ];

    for (const { pattern, series } of prefixPatterns) {
        const match = rawName.match(pattern);
        if (match) {
            const numbersStr = match[2];
            // Split by common separators: -, /, ,, &
            const numberParts = numbersStr.split(/[-\/,&]/).map(s => s.trim()).filter(s => /\d/.test(s));

            const models: string[] = [];
            for (const num of numberParts) {
                const cleanNum = num.replace(/[^\d]/g, '');
                if (cleanNum) {
                    models.push(`${series} ${cleanNum}`);
                }
            }

            return { series, models };
        }
    }

    return { series: null, models: [] };
}

// Keep the old function for backward compatibility but using new logic
export function expandModelNames(rawName: string): string[] {
    return extractSeriesAndModels(rawName).models;
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
     * 
     * @param pathSegments Array of folder names from root to file (excluding file name)
     */
    async classifyFromSegments(pathSegments: string[], fileName: string, useAI: boolean = false): Promise<ClassificationResult> {
        if (pathSegments.length < 3) {
            throw new Error(`Invalid Path Structure. Too shallow. Expected at least: Dept/Category/Topic. Got: ${pathSegments.join('/')}`);
        }

        let [deptName, catName, topicName] = pathSegments;
        let brandName = pathSegments.length > 3 ? pathSegments[3] : undefined;
        let modelName = pathSegments.length > 4 ? pathSegments[4] : undefined;
        let extraTags = pathSegments.slice(5);
        let source: 'AI' | 'Regex' | 'Hybrid' | 'Heuristic' = 'Heuristic';

        // --- AI ENHANCEMENT ---
        if (useAI && this.aiService) {
            const aiResult = await this.aiService.analyzeFilename(fileName, pathSegments);
            if (aiResult) {
                source = 'AI';
                // If AI found better context, override or fill gaps
                if (aiResult.brand) brandName = aiResult.brand;
                if (aiResult.model) modelName = aiResult.model;
                if (aiResult.specificModel) extraTags.push(aiResult.specificModel);
                if (aiResult.tags) extraTags.push(...aiResult.tags);
                if (aiResult.category && !catName) catName = aiResult.category;
                if (aiResult.topic && !topicName) topicName = aiResult.topic;

                // Allow specific model to override model name if we only had generic
                if (aiResult.model && !modelName) modelName = aiResult.model;
            }
        }

        // --- FALLBACK METADATA EXTRACTION (REGEX) ---
        // If AI failed or didn't run, check if we still need critical info
        if (!brandName || !modelName) {
            const extracted = this.extractMetadataFromName(fileName);
            if (extracted.brand || extracted.series) {
                if (source === 'AI') source = 'Hybrid'; // AI tried but we needed regex too
                else source = 'Regex';
            }

            if (!brandName && extracted.brand) brandName = extracted.brand;
            if (!modelName && extracted.series) modelName = extracted.series;
            if (extracted.specificModel) extraTags.push(extracted.specificModel);
        }

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
        const topicSlug = this.generateSlug(topicName);
        let topic = await this.prisma.documentTopic.findFirst({
            where: {
                categoryId: category.id,
                slug: topicSlug
            }
        });

        if (!topic) {
            topic = await this.prisma.documentTopic.create({
                data: {
                    name: topicName,
                    slug: topicSlug,
                    categoryId: category.id
                }
            });
        }

        let brand: Brand | undefined;
        let models: MachineModel[] = [];

        // ================================================================
        // CRITICAL FIX: Extract Brand & Models from FILENAME first
        // Then fallback to folder structure
        // ================================================================

        // Step 1: Always try to extract from filename (highest priority)
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
        let extractedBrand = cleanAndExtractBrand(fileNameWithoutExt);

        // Use new extractSeriesAndModels for series (Model label) and specific models (Tags)
        const { series: extractedSeries, models: specificModels } = extractSeriesAndModels(fileNameWithoutExt);

        // Add specific model numbers to tags (e.g., "MPC 3054", "MPC 4054")
        if (specificModels.length > 0) {
            extraTags.push(...specificModels);
        }

        // Step 2: If filename didn't give us brand, try folder level 4
        if (!extractedBrand && brandName) {
            extractedBrand = cleanAndExtractBrand(brandName);
        }

        // Step 3: If still no brand, use legacy extractMetadataFromName for edge cases
        if (!extractedBrand) {
            const legacyExtracted = this.extractMetadataFromName(fileName);
            if (legacyExtracted.brand) {
                extractedBrand = legacyExtracted.brand;
            }
            // Also append specificModel to tags if found
            if (legacyExtracted.specificModel) {
                extraTags.push(legacyExtracted.specificModel);
            }
        }

        // Step 4: Update source based on what was found
        if (extractedBrand || extractedSeries) {
            if (source === 'Heuristic') source = 'Regex';
        }

        // Step 5: Create/Find Brand in DB
        if (extractedBrand) {
            brand = await this.prisma.brand.upsert({
                where: { name: extractedBrand },
                update: {},
                create: { name: extractedBrand }
            });
        } else {
            // No valid brand found anywhere - assign to UNKNOWN
            // Only log warning if there was some attempt to parse
            if (brandName || fileNameWithoutExt.length > 5) {
                console.warn(`[WARN] No valid Brand in: "${fileName}" (folder: "${brandName || 'N/A'}") -> UNKNOWN`);
            }
            brand = await this.prisma.brand.upsert({
                where: { name: 'UNKNOWN' },
                update: {},
                create: { name: 'UNKNOWN' }
            });
        }

        // Step 6: Create/Find Model in DB using SERIES only (e.g., "MPC", "MP", "e-Studio")
        // Specific model numbers are now in Tags
        if (extractedSeries && brand) {
            let m = await this.prisma.machineModel.findFirst({
                where: { name: extractedSeries, brandId: brand.id }
            });
            if (!m) {
                try {
                    m = await this.prisma.machineModel.create({
                        data: { name: extractedSeries, brandId: brand.id }
                    });
                } catch (e) {
                    // Race condition or duplicate
                    m = await this.prisma.machineModel.findFirst({ where: { name: extractedSeries } });
                }
            }
            if (m) models.push(m);
        }

        // Deduplicate tags
        extraTags = Array.from(new Set(extraTags.filter(t => t && t.trim().length > 0)));

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

    private extractMetadataFromName(fileName: string): { brand?: string, series?: string, specificModel?: string } {
        // Normalize
        const name = fileName.toUpperCase();
        let brand: string | undefined;
        let series: string | undefined;
        let specificModel: string | undefined;

        // KNOWN BRANDS
        const BRANDS = ['RICOH', 'TOSHIBA', 'CANON', 'SHARP', 'HP', 'KONICA', 'KYOCERA', 'BROTHER', 'EPSON', 'XEROX', 'SAMSUNG', 'PANASONIC'];
        for (const b of BRANDS) {
            if (name.includes(b)) { // Simple contains check
                brand = b === 'KONICA' ? 'Konica Minolta' : (b.charAt(0).toUpperCase() + b.slice(1).toLowerCase());
                break;
            }
        }

        // KNOWN SERIES PATTERNS
        const PATTERNS = [
            { series: 'MP', regex: /\bMP\s?(\d+)\b/ },
            { series: 'MPC', regex: /\bMPC\s?(\d+)\b/ },
            { series: 'SP', regex: /\bSP\s?(\d+)\b/ },
            { series: 'Aficio', regex: /\bAficio\b/i },

            { series: 'e-Studio', regex: /\be-?Studio\s?(\d+)\b/i },
            { series: 'iR', regex: /\biR\s?(\d+)\b/i },
            { series: 'iR-ADV', regex: /\biR-?ADV\s?(\d+)\b/i },
        ];

        for (const p of PATTERNS) {
            const match = name.match(p.regex);
            if (match) {
                series = p.series; // The standardized series name
                if (match[1]) {
                    specificModel = `${series} ${match[1]}`;
                }

                if (!brand) {
                    if (['MP', 'MPC', 'SP', 'Aficio'].includes(series)) brand = 'Ricoh';
                    if (['e-Studio'].includes(series)) brand = 'Toshiba';
                    if (['iR', 'iR-ADV'].includes(series)) brand = 'Canon';
                }
                break; // Take first match
            }
        }

        // Special handling for "MP6001" joined
        if (!series) {
            const joinedMatch = name.match(/\b(MP|MPC|SP|IM)(\d{4,})\b/);
            if (joinedMatch) {
                series = joinedMatch[1];
                specificModel = `${series} ${joinedMatch[2]}`;
                if (!brand) brand = 'Ricoh';
            }
        }

        return { brand, series, specificModel };
    }

    private generateSlug(text: string): string {
        return slugify(text, { lower: true, strict: true, locale: 'vi' });
    }
}
