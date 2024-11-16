# Stage 1: Base stage
FROM node:18-alpine AS base
RUN npm i -g pnpm

# Stage 2: Dependencies
FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 3: Build (for production only)
FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build
RUN pnpm prune --prod

# Stage 4: Production Deploy
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
CMD ["node", "dist/main.js"]

# Stage 5: Development
FROM base AS development
WORKDIR /app
ENV NODE_ENV=development
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
EXPOSE 3000
CMD ["pnpm", "run", "start:dev"]
