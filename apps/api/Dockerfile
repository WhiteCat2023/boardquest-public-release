# Multi-stage Dockerfile for Backend API
FROM node:22-alpine AS builder

WORKDIR /app

# Install required build tools & libraries for Prisma / Argon2 on Alpine
RUN apk add --no-cache openssl libc6-compat python3 make g++

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy root workspace configs and package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/admin/package.json apps/admin/
COPY apps/game/package.json apps/game/
COPY apps/review-center/package.json apps/review-center/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source and Prisma schema
COPY apps/api ./apps/api

# Generate Prisma Client and compile TypeScript
WORKDIR /app/apps/api
RUN npx prisma generate
RUN pnpm build

# Production Runner Image
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install runtime libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["node", "dist/index.js"]
