import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Just try a simple generation with a few known candidates to see which one works
        const candidates = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.0-pro'];

        console.log("Testing Model Availability...");

        for (const modelName of candidates) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("Test");
                console.log("✅ Custom Access OK");
            } catch (e: any) {
                console.log(`❌ Failed: ${e.message?.slice(0, 100)}...`);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

listModels();
