# ==========================================
# Stage 1 — Base (shared setup)
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ==========================================
# Stage 2 — Dependencies for development
# ==========================================
FROM base AS deps-dev
RUN npm install

# ==========================================
# Stage 3 — Dependencies for production
# ==========================================
FROM base AS deps-prod
RUN npm ci --omit=dev

# ==========================================
# Stage 4 — Build (TypeScript → JS)
# ==========================================
FROM deps-dev AS builder
COPY . .
RUN npm run build

# ==========================================
# Stage 5 — Development runtime
# ==========================================
FROM deps-dev AS dev
WORKDIR /app
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ==========================================
# Stage 6 — Production runtime
# ==========================================
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY --from=deps-prod /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
