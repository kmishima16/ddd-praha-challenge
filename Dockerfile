# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.19.5
ARG PNPM_VERSION=9.15.9

# ============================================================
# base: Node.js + pnpm のセットアップ
# ============================================================
FROM node:${NODE_VERSION}-bookworm-slim AS base

ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# ============================================================
# deps: 依存関係のインストール（pnpm store をキャッシュマウントで管理）
# ============================================================
FROM base AS deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile

# ============================================================
# build: TypeScript → dist/index.mjs にコンパイル
# ============================================================
FROM deps AS build

COPY . .
RUN pnpm build

# ============================================================
# final: 実行環境（最小構成）
# ============================================================
FROM node:${NODE_VERSION}-bookworm-slim AS final

ARG PNPM_VERSION

WORKDIR /app

# セキュリティ: 非 root ユーザーで実行
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup --no-create-home appuser && \
    mkdir -p /app/.cache/corepack && chown -R appuser:appgroup /app/.cache

ENV COREPACK_HOME=/app/.cache/corepack

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# ビルド成果物 + 実行に必要なファイルをコピー
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=build --chown=appuser:appgroup /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build --chown=appuser:appgroup /app/src/libs/drizzle ./src/libs/drizzle
COPY --from=build --chown=appuser:appgroup /app/src/libs/ulid ./src/libs/ulid

USER appuser

EXPOSE 3000

CMD ["node", "dist/index.mjs"]
