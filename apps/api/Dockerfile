# Multi-stage Dockerfile for Backend API
FROM node:22-slim AS builder

WORKDIR /app

# Install OpenSSL & certificates required for Prisma and network requests
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm reliably
RUN npm install -g pnpm@11.20.0

# Copy root workspace configs and package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/admin/package.json apps/admin/
COPY apps/review-center/package.json apps/review-center/

# Install workspace dependencies (utilizing precompiled glibc binaries on Debian)
RUN pnpm install --frozen-lockfile

# Copy backend source and Prisma schema
COPY apps/api ./apps/api

# Generate Prisma Client and compile TypeScript
WORKDIR /app/apps/api
ENV DATABASE_URL="mongodb://localhost:27017/placeholder"
RUN npx prisma generate
RUN pnpm build

# Production Runner Image
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma engine runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@11.20.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/src ./apps/api/src
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["npx", "tsx", "src/index.ts"]
