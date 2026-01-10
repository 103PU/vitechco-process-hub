import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIClassificationResult {
    brand?: string;
    model?: string;
    specificModel?: string; // e.g. "MPC 3504"
    category?: string;      // e.g. "Instruction Manual" -> "Tài Liệu"
    topic?: string;         // e.g. "Service Manual" -> "Kỹ Thuật"
    summary?: string;       // Short summary of what the file likely is
    tags?: string[];
}

export class AIClassificationService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
    }

    async analyzeFilename(fileName: string, pathSegments: string[]): Promise<AIClassificationResult | null> {
        let retries = 0;
        const MAX_RETRIES = 3;

        while (retries < MAX_RETRIES) {
            try {
                // Rate Limiting: Artificial delay to be nice to the API
                await new Promise(resolve => setTimeout(resolve, 2000));

                const prompt = `
                Analyze the following file path and name to extract structured metadata for a Printer/Copier machine database.
                
                File Name: "${fileName}"
                Path Context: "${pathSegments.join('/')}"
    
                Context:
                - Brands are typically: Ricoh, Toshiba, Canon, Sharp, HP, Kyocera, Konica Minolta.
                - Models are typically series codes like: MP, MPC, IM, SP (for Ricoh), e-Studio (for Toshiba), iR, iR-ADV (for Canon).
                - Specific Model is the Series + Number, e.g., "MPC 3504", "MP 6001".
                - Category Hints: "Tài liệu" (Docs), "Driver", "Firmware", "Hình ảnh" (Images).
                - Topic Hints: "Service Manual", "User Guide", "Brochure", "Installation".
    
                Return ONLY a JSON object with this structure (no markdown, no code blocks):
                {
                    "brand": "string or null",
                    "model": "string (Series only, e.g. MPC) or null",
                    "specificModel": "string (Full model e.g. MPC 3504) or null",
                    "category": "string or null (Mapped to Vietnamese if possible: Tài Liệu, Driver, Firmware)",
                    "topic": "string or null",
                    "tags": ["string", "string"]
                }
                `;

                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean up if markdown code block is returned
                const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

                return JSON.parse(cleanJson) as AIClassificationResult;

            } catch (error: any) {
                if (error.status === 429 || (error.message && error.message.includes('429'))) {
                    retries++;
                    const waitTime = retries * 5000; // 5s, 10s, 15s
                    console.log(`⚠️  Rate Limit hit. Waiting ${waitTime / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    console.error("AI Classification Failed:", error);
                    return null; // Fallback to regex immediately for non-rate-limit errors
                }
            }
        }
        return null;
    }
}
