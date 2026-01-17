import type { NextConfig } from "next";

// Bundle analyzer for build optimization (Vercel recommendation)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // Inject version info for frontend-backend sync (Vercel recommendation)
    env: {
        NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
        NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
        NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    },
};

export default withBundleAnalyzer(nextConfig);
