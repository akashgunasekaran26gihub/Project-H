# Multi-stage Dockerfile for AI Habit Tracker Full Stack

# 1. Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2. Production Server
FROM node:20-alpine AS runner
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production
COPY backend/ ./
RUN npx prisma generate

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV NODE_ENV=production
ENV PORT=5001
EXPOSE 5001

CMD ["node", "src/index.js"]
