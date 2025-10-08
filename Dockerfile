# ==========================================
# Stage 1 — Base (shared setup)
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ==========================================
# Stage 2 — Dependencies
# ==========================================
FROM base AS deps
RUN npm install

# ==========================================
# Stage 3 — Build (TypeScript → JS)
# ==========================================
FROM deps AS builder
COPY . .
RUN npm run build

# ==========================================
# Stage 4 — Development runtime
# ==========================================
FROM deps AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ==========================================
# Stage 5 — Production runtime
# ==========================================
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
