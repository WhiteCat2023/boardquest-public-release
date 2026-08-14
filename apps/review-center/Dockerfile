# Multi-stage Dockerfile for Review Center Frontend (Vite + Nginx)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configs and lockfiles
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/review-center/package.json apps/review-center/

# Install pnpm globally
RUN npm install -g pnpm@11.20.0
RUN pnpm install --frozen-lockfile

# Copy review-center source files
COPY apps/review-center ./apps/review-center

# Build static Vite assets
WORKDIR /app/apps/review-center
ENV VITE_API_URL=/api
RUN pnpm build

# Serve compiled static assets via Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/review-center/dist /usr/share/nginx/html
COPY apps/review-center/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
