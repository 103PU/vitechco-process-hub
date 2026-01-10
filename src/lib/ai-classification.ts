import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIClassificationResult {
    brand?: string;
    models?: string[]; // Array of full model names e.g. ["MPC 3054", "MPC 4054"]
    category?: string;
    topic?: string;
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
    
                STRICT RULES:
                1. **BRAND**: Must be one of: Ricoh, Toshiba, Canon, Sharp, HP, Kyocera, Konica Minolta, Xerox, Brother, Epson, Samsung, Panasonic, Lexmark, Oki. 
                   - If the input contains "TEST MÁY RICOH", the Brand is "Ricoh". Ignore "TEST", "MÁY", "OFFICE".
                   - If NO valid brand is found, return null. DO NOT invent new brands.
                
                2. **MODELS (CRITICAL)**: Return an ARRAY of specific model names.
                   - **Expand Ranges/Lists**: "MPC 3054-4054-5054" -> ["MPC 3054", "MPC 4054", "MPC 5054"]
                   - **Mixed Series**: "MPC 6503-8003- Pro C5200S-C5210S" -> ["MPC 6503", "MPC 8003", "Pro C5200S", "Pro C5210S"]
                   - **Delimiters**: Handle "-", "/", ",", "&" as separators.
                   - Always attach the Series Prefix (e.g., "MPC") to the number if missing.

                3. **Context**:
                   - Category Hints: "Tài liệu" (Docs), "Driver", "Firmware".
                   - Topic Hints: "Service Manual", "User Guide", "Brochure".
    
                Return ONLY a valid JSON object (no markdown, no comments):
                {
                    "brand": "string (Canonical Name) or null",
                    "models": ["string", "string"],
                    "category": "string or null",
                    "topic": "string or null",
                    "tags": ["string"]
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
