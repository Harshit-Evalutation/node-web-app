# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:18-alpine AS dependencies

LABEL maintainer="DevOps Command Center"
LABEL description="Production-ready DevOps monitoring dashboard"

WORKDIR /app

# Install dependencies first (leverages Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ─── Stage 2: Production Image ────────────────────────────────────────────────
FROM node:18-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S devops -u 1001 -G nodejs

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies --chown=devops:nodejs /app/node_modules ./node_modules

# Copy application source code
COPY --chown=devops:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R devops:nodejs logs

# Switch to non-root user
USER devops

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "app.js"]
