import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Polyfill fetch if needed (Node 18+ has it native)
// import fetch from 'node-fetch'; 
// (Not needed for Node 20+)

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

async function main() {
    console.log("Checking API Key validity and listing models...");

    // Direct REST call to bypass SDK potential defaults if needed, but SDK has listModels too (though not on the main class directly in earlier versions? Let's try to infer).
    // Actually the SDK doesn't expose listModels easily in the main entry point in all versions.
    // Let's use a raw fetch to debug the exact response from the endpoint.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
        } else {
            const data = await response.json();
            console.log("Available Models:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Network/Fetch Error:", e);
    }
}

main();
