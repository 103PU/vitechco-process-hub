# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Dummy DB URL for prisma generate at build time
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"

# Install dependencies in a separate builder stage
FROM base AS deps
# Copy only package.json and package-lock.json for better cache utilization
COPY --link package.json package-lock.json ./
# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Build the app
FROM deps AS builder
COPY --link . .
# Generate Prisma client for type safety
RUN npx prisma generate
# If you have a build step (e.g., Next.js, TypeScript)
RUN --mount=type=cache,target=/root/.npm \
    npm run build

# Production image, copy only necessary files
FROM base AS final
# Create a non-root user
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
USER appuser

# Copy built app and production node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

EXPOSE 3000
CMD ["npm", "start"]
