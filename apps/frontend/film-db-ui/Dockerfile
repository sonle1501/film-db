# Build stage
FROM node:22-alpine AS builder

# Install libc6-compat for compatibility with native modules
RUN apk add --no-cache libc6-compat

# Enable corepack to use pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency configs
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy app code
COPY . .

# Set Environment Variables for Production
ENV NODE_ENV=production

# Next.js requires public API URL at build time for static site compilation
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG INTERNAL_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL

# Build the Next.js app
RUN pnpm build

# Runner stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public, static files, and standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
