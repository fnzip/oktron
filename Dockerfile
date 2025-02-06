# Stage 1: Build
FROM oven/bun:1.2.2-alpine as builder

WORKDIR /app

COPY bun.lockb package.json .

RUN bun install

# Stage 2: Run
FROM builder as runner

WORKDIR /app

COPY . .


CMD ["bun", "run", "src/app.ts"]