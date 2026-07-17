# Multi-stage build: compile TypeScript in a full Node image, then ship only
# the production runtime artifacts in a slim image.

FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

# Production image — no Nest CLI / TypeScript / test tooling.
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]
