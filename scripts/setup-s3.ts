import 'dotenv/config';
import { s3Client } from '../src/lib/storage/s3.js';
import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

async function main() {
    const bucket = process.env.S3_BUCKET || "vitechco-assets";
    console.log(`Checking bucket: ${bucket}...`);
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
        console.log(`✅ Bucket '${bucket}' already exists.`);
    } catch (error: any) {
        // Check for 404 Not Found
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            console.log(`   Bucket not found. Creating...`);
            try {
                await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
                console.log(`✅ Bucket '${bucket}' created successfully.`);
            } catch (createError) {
                console.error("❌ Failed to create bucket:", createError);
                process.exit(1);
            }
        } else {
            console.error("❌ Error checking bucket:", error);
            // process.exit(1); // Don't exit hard, maybe it's connection issue we can retry or ignore
        }
    }
}

main().catch(console.error);
