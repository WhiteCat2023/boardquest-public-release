# Multi-stage Dockerfile for Admin Frontend (Vite + Nginx)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configs and lockfiles
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/admin/package.json apps/admin/

# Install pnpm globally
RUN npm install -g pnpm@11.20.0
RUN pnpm install --frozen-lockfile

# Copy admin source files
COPY apps/admin ./apps/admin

# Build static Vite assets
WORKDIR /app/apps/admin
ENV VITE_API_URL=/api
RUN pnpm build

# Serve compiled static assets via Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
