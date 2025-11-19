# Build stage
FROM node:24-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY src ./src
COPY scripts ./scripts
COPY tsconfig.json ./tsconfig.json
COPY vitest.config.ts ./vitest.config.ts

# Install dependencies and build
RUN npm install && npm run build

# Runtime stage
FROM node:24-alpine
WORKDIR /app

# Copy only production files
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

RUN mkdir -p /workspace

# Ensure application files are readable by any UID
# This is necessary because we run the container with --user flag at runtime
RUN chmod -R a+rX /app

WORKDIR /workspace

EXPOSE 5000

CMD ["sh", "-c", "node /app/dist/index.js ${SPEC_WORKFLOW_PATH:-/workspace} --dashboard --port ${DASHBOARD_PORT:-3000}"]
