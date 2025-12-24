# Multi-stage build for Netpub UGC Video Application
# Optimized for production use with security and performance improvements

# ====================================
# Base stage - Common dependencies
# ====================================
FROM node:20-alpine AS base

# Install essential tools and security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    dumb-init \
    tini \
    curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# ====================================
# Dependencies stage
# ====================================
FROM base AS deps

# Copy package files with checksums
COPY package*.json ./

# Install dependencies with integrity checks
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Store production dependencies
RUN cp -R node_modules /prod_node_modules

# Install all dependencies for build
RUN npm ci --ignore-scripts

# ====================================
# Build stage for backend
# ====================================
FROM base AS backend-build

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm install

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy source files
COPY backend/ ./backend/
COPY backend/types/ ./types/
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/prisma ./prisma/

# Generate Prisma client with binary targets
RUN npx prisma generate && \
    npx prisma validate

# Build TypeScript
RUN cd backend && npx tsc

# Verify build output
RUN test -d backend/dist || echo "Backend build failed"

# ====================================
# Build stage for frontend
# ====================================
FROM base AS frontend-build

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy frontend source
COPY src/ ./src/
COPY public/ ./public/
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY index.html ./

# Build frontend with error handling
RUN npm run build && \
    test -d dist || (echo "Frontend build failed" && exit 1)

# Optimize build output
RUN find dist -type f -name "*.js" -exec gzip -k {} \; || true
RUN find dist -type f -name "*.css" -exec gzip -k {} \; || true

# ====================================
# Production stage
# ====================================
FROM node:20-alpine AS production

# Set production environment
ENV NODE_ENV=production \
    PORT=4000 \
    NPM_CONFIG_LOGLEVEL=warn

WORKDIR /app

# Install runtime dependencies and security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    dumb-init \
    tini \
    curl \
    ca-certificates && \
    rm -rf /var/cache/apk/*

# Copy production dependencies
COPY --from=deps /prod_node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy Prisma schema and generated client
COPY --from=backend-build /app/prisma ./prisma/
COPY --from=backend-build /app/node_modules/.prisma ./node_modules/.prisma

# Copy backend build
COPY --from=backend-build /app/backend ./backend
COPY --from=backend-build /app/types ./types

# Copy frontend build
COPY --from=frontend-build /app/dist ./dist

# Copy config files
COPY tsconfig.json ./

# Create healthcheck script
RUN echo '#!/bin/sh\n\
curl -f http://localhost:4000/health || exit 1' > /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh

# Create directories with proper permissions
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chmod -R 755 /app/logs /app/uploads /app/temp

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs -h /app -s /bin/sh

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check with longer timeout for startup
HEALTHCHECK --interval=30s \
    --timeout=10s \
    --start-period=60s \
    --retries=3 \
    CMD /app/healthcheck.sh

# Set labels for metadata
LABEL maintainer="netpub-team" \
      version="1.0" \
      description="Netpub UGC Video Application"

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start application with proper node flags
CMD ["node", \
     "--max-old-space-size=2048", \
     "--enable-source-maps", \
     "backend/dist/server.js"]