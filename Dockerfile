# Multi-stage build for Netpub UGC Video Application

# Build stage for backend
FROM node:20-alpine AS backend-build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./backend/
COPY types/ ./types/
COPY tsconfig.json ./

# Generate Prisma client
RUN npx prisma generate

# Build the backend
RUN npm install -g tsx
RUN npx tsc --project tsconfig.json

# Build stage for frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./tsconfig.node.json

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend build output from build stage
COPY --from=backend-build /app/backend ./backend
COPY --from=backend-build /app/types ./types
COPY --from=backend-build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-build /app/package.json ./package.json

# Copy frontend build output from build stage
COPY --from=frontend-build /app/dist ./dist

# Copy additional files
COPY prisma ./prisma/
COPY tsconfig.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "-r", "tsx/cjs", "backend/server.ts"]