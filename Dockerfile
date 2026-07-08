# clinic-full-stack – Dockerfile (Cloud Run, Next.js standalone)
# Build-arg: NEXT_PUBLIC_API_URL (URL da API no deploy)

# ---- Dependencies ----
  FROM node:20-alpine AS deps
  RUN corepack enable && corepack prepare pnpm@latest --activate
  WORKDIR /app
  
  COPY package.json pnpm-lock.yaml* ./
  RUN pnpm install --frozen-lockfile
  
  # ---- Build ----
  FROM node:20-alpine AS builder
  RUN corepack enable && corepack prepare pnpm@latest --activate
  WORKDIR /app
  
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  
  ARG NEXT_PUBLIC_API_URL
  ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
  ENV NEXT_TELEMETRY_DISABLED=1
  
  RUN pnpm run build
  
  # ---- Runner (mínimo; só standalone output) ----
  FROM node:20-alpine AS runner
  WORKDIR /app
  
  ENV NODE_ENV=production
  ENV NEXT_TELEMETRY_DISABLED=1
  ENV HOSTNAME="0.0.0.0"
  ENV PORT=8080
  EXPOSE 8080
  
  RUN addgroup --system --gid 1001 nodejs
  RUN adduser --system --uid 1001 nextjs
  
  COPY --from=builder /app/public ./public
  COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
  COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
  
  USER nextjs
  CMD ["node", "server.js"]
  