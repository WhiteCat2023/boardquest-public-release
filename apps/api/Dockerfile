# Multi-stage Dockerfile for Backend API
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configs and lockfiles
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/

# Install pnpm globally
RUN npm install -g pnpm@11.20.0
RUN pnpm install --frozen-lockfile

# Copy backend source and Prisma schema
COPY apps/api ./apps/api

# Generate Prisma Client and compile TypeScript
WORKDIR /app/apps/api
RUN npx prisma generate
RUN pnpm build

# Production Runner Image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm@11.20.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["node", "dist/index.js"]
