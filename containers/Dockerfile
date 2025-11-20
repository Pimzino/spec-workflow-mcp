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

# Build the application
RUN npm run build

# Runtime stage
FROM node:24-alpine
WORKDIR /app

# Copy only production files
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

RUN mkdir -p /workspace

# Change ownership of the app directory to the node user (uid=1000)
RUN chown -R node:node /app /workspace

# Switch to the node user to match host user permissions
USER node

WORKDIR /workspace

EXPOSE 5000

CMD node /app/dist/index.js ${SPEC_WORKFLOW_PATH:-/workspace} --dashboard --port ${DASHBOARD_PORT:-5000}
