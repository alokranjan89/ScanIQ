FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY server/package*.json ./
COPY server/prisma ./prisma
COPY server/prisma.config.ts ./

# Prisma's config requires a URL during client generation; runtime supplies the real one.
ENV DATABASE_URL=postgresql://scaniq:build-only@localhost:5432/scaniq?schema=public

RUN npm ci
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY server/tsconfig.json ./
COPY server/src ./src

RUN npx prisma generate && npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://scaniq:build-only@localhost:5432/scaniq?schema=public

COPY server/package*.json ./
COPY server/prisma ./prisma
COPY server/prisma.config.ts ./
RUN npm ci --omit=dev
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist ./dist

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/server.js"]
