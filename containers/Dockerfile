# Build stage
FROM node:24-alpine AS builder
RUN apk add --no-cache git

WORKDIR /app

# Clone the MCP server during build
RUN git clone --depth 1 https://github.com/GavenXia/lls-spec-mcp.git .

# Install dependencies and build
RUN npm ci && npm run build

# Runtime stage
FROM node:24-alpine
WORKDIR /app

# Install Pandoc for document conversion
RUN apk add --no-cache pandoc && \
    pandoc --version && \
    echo "Pandoc installed successfully"

# Copy only production files
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy built application and necessary resources
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/locales ./src/locales

RUN mkdir -p /workspace

# Change ownership of the app directory to the node user (uid=1000)
RUN chown -R node:node /app /workspace

# Switch to the node user to match host user permissions
USER node

WORKDIR /workspace

EXPOSE 3000

CMD node /app/dist/index.js ${SPEC_WORKFLOW_PATH:-/workspace} --dashboard --port ${DASHBOARD_PORT:-3000}
