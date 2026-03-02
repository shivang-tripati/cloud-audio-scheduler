# ---------- Stage 1: Builder ----------

FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY src ./src



# ---------- Stage 2: Runtime ----------

FROM node:22-alpine AS runtime

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy app source
COPY --from=builder /app/src ./src

# Copy package.json (optional but recommended)
COPY --from=builder /app/package.json ./package.json


# Create all runtime writable directories
RUN mkdir -p /app/logs \
    && mkdir -p /app/uploads/audio \
    && chown -R node:node /app


# Run as non-root user (security best practice)
USER node

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/server.js"]