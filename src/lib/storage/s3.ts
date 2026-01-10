import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const S3_ENDPOINT = process.env.S3_ENDPOINT || "http://localhost:9000"
const S3_REGION = process.env.S3_REGION || "us-east-1"
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || "minioadmin"
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || "minioadmin"
const S3_BUCKET = process.env.S3_BUCKET || "vitechco-assets"

// Max file size: 100MB
const MAX_FILE_SIZE_BYTES = (parseInt(process.env.FILE_MAX_SIZE_MB || "100", 10)) * 1024 * 1024

export const s3Client = new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Required for MinIO
})

export class StorageError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "StorageError"
    }
}

// Local fallback state
let isS3Available = true;

/**
 * Ensure the bucket exists, create if not
 */
export async function ensureBucketExists() {
    try {
        // Add timeout to prevent hanging if MinIO is down
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("S3 Connection Timeout")), 2000)
        );

        await Promise.race([
            s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET })),
            timeoutPromise
        ]);

    } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            // ... create logic ...
            try {
                await s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET }))
                console.log(`   ✅ Bucket ${S3_BUCKET} created.`)
            } catch (createError) {
                console.error("Failed to create bucket:", createError)
                throw new StorageError("Failed to create S3 bucket")
            }
        } else {
            console.warn("⚠️  S3 Unreachable (Timeout or Error). Switching to Dummy Local Mode.");
            console.warn(`   Error: ${error.message}`);
            isS3Available = false;
            // Do not throw, allow app to continue
        }
    }
}

// ...

/**
 * Upload a file directly (server-side)
 */
export async function uploadFile(key: string, body: Buffer | Uint8Array | Blob | string, contentType: string) {
    if (!isS3Available) {
        // Dummy upload for local testing
        return { key, bucket: S3_BUCKET, url: `/local-assets/${key}` };
    }

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
    })
    try {
        await s3Client.send(command)
        return { key, bucket: S3_BUCKET, url: `${S3_ENDPOINT}/${S3_BUCKET}/${key}` }
    } catch (error) {
        console.error("S3 Upload Error, falling back to local stub:", error)
        return { key, bucket: S3_BUCKET, url: `/local-assets/${key}` }; // Fallback
    }
}

/**
 * Get a signed URL for reading a file (if bucket is private)
 */
export async function getFileUrl(key: string) {
    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    })
    return getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

/**
 * Delete a file
 */
export async function deleteFile(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
    })
    try {
        await s3Client.send(command)
    } catch (error) {
        console.error("S3 Delete Error:", error)
        throw new StorageError("Failed to delete file")
    }
}
