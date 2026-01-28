# プラハチャレンジ DDD実装

ドメイン駆動設計（DDD）とオニオンアーキテクチャを採用した学習管理システムのバックエンドAPIです。

## 📚 目次

- [クイックスタート](#-クイックスタート)
- [プロジェクト概要](#-プロジェクト概要)
- [技術スタック](#-技術スタック)
- [開発コマンド](#-開発コマンド)
- [APIエンドポイント](#-apiエンドポイント)
- [ドキュメント](#-ドキュメント)

## 🚀 クイックスタート

### 前提条件

- Node.js 20.x
- pnpm 9.x
- Docker / Docker Compose

### セットアップ手順

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数の設定
cp .env.example .env

# 3. データベースの起動
docker compose up -d

# 4. マイグレーションの実行
pnpm run migration:apply

# 5. 初期データの投入（マスターデータ + レッスン）
pnpm run seed

# 6. 開発サーバーの起動
pnpm run dev
```

サーバーが `http://localhost:3000` で起動します。

### 動作確認

```bash
# 生徒一覧を取得（空の配列が返れば成功）
curl http://localhost:3000/students

# 生徒を作成
curl -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "山田太郎", "mailAddress": "yamada@example.com"}'
```

詳細なAPIテストは [docs/setup-commands/api-test.sh](docs/setup-commands/api-test.sh) を参照してください。

## 📖 プロジェクト概要

### ドメイン概念

| 概念 | 説明 |
|------|------|
| **参加者（Student）** | 名前・メールアドレス・在籍ステータス（在籍中/休会中/退会済）を持つ |
| **チーム（Team）** | 2〜4名で構成。英字の名前を持ち、人数変動時に分割・合流が発生 |
| **課題（Lesson）** | 80種類程度。カテゴリごとに分類される |
| **課題進捗（LessonProgress）** | 参加者×課題ごとの進捗状態（未着手→取組中→レビュー待ち→完了） |

詳細な仕様は [docs/仕様.md](docs/仕様.md) を参照してください。

### アーキテクチャ

オニオンアーキテクチャを採用しています。

```
src/
├── domain/           # ドメイン層（ビジネスロジックの中核）
│   ├── model/        # エンティティ・値オブジェクト・集約
│   ├── repository/   # リポジトリインターフェース
│   └── specification/# 仕様パターンインターフェース
├── application/      # アプリケーション層（ユースケース）
│   ├── use-case/     # コマンド系
│   └── query-service/# クエリ系（CQRS）
├── infrastructure/   # インフラストラクチャ層（永続化実装）
│   ├── repository/   # リポジトリ実装（PostgreSQL）
│   └── query-service/# クエリサービス実装
├── presentation/     # プレゼンテーション層（HTTPハンドラ）
└── libs/             # 共通ユーティリティ
    └── drizzle/      # DB接続・スキーマ・マイグレーション
```

詳細なアーキテクチャガイドは [.github/copilot-instructions.md](.github/copilot-instructions.md) を参照してください。

## 🛠 技術スタック

| カテゴリ | 技術 |
|---------|------|
| ランタイム | Node.js 20.x |
| 言語 | TypeScript 5.x |
| Webフレームワーク | Hono |
| ORM | Drizzle ORM |
| データベース | PostgreSQL 15 |
| バリデーション | Zod |
| テスト | Vitest |
| リンター/フォーマッター | Biome |
| パッケージマネージャ | pnpm |

## 💻 開発コマンド

```bash
# 開発サーバー起動（ホットリロード対応）
pnpm run dev

# 静的解析 + 型チェック
pnpm run lint

# テスト実行
pnpm run test
pnpm run test:watch  # ウォッチモード

# ビルド
pnpm run build
pnpm run start       # ビルド後の起動

# データベース関連
pnpm run migration:generate  # マイグレーションファイル生成
pnpm run migration:apply     # マイグレーション適用
pnpm run migration:drop      # マイグレーション削除
pnpm run seed                # 初期データ投入
```

## 🔌 APIエンドポイント

### 参加者（Student）

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/students` | 参加者一覧取得 |
| POST | `/students/new` | 参加者作成 |

### チーム（Team）

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/teams/new` | チーム作成 |
| POST | `/teams/:teamId/members/add` | メンバー追加 |
| DELETE | `/teams/members/:studentId` | メンバー削除 |
| POST | `/teams/:teamId/split` | チーム分割 |
| DELETE | `/teams/:teamId/disband` | チーム解散 |

### 課題進捗（LessonProgress）

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/lesson-progress/new` | 課題進捗作成 |
| PUT | `/lesson-progress/:studentId/:lessonId/in-progress` | 取組中に変更 |
| PUT | `/lesson-progress/:studentId/:lessonId/in-review` | レビュー待ちに変更 |
| PUT | `/lesson-progress/:studentId/:lessonId/completed` | 完了に変更 |

### 課題（Lesson）

| Method | Endpoint | 説明 |
|--------|----------|------|
| POST | `/lessons/new` | 課題作成 |

## 📄 ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [docs/仕様.md](docs/仕様.md) | ドメインの詳細仕様 |
| [docs/initial-data-setup.md](docs/initial-data-setup.md) | 初期データセットアップ手順 |
| [docs/setup-commands/](docs/setup-commands/) | APIテスト・データ確認用シェルスクリプト |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | DDDオニオンアーキテクチャ実装ガイド |

## ⚠️ 注意事項

このリポジトリは学習目的のテンプレートです。以下の点は改善の余地があります：

- Nominal Typing（構造的部分型の制限）
- より厳密なValue Objectの実装
- DIコンテナの導入
- Result型によるエラーハンドリング

あるべき姿を模索しつつ実装を進めてください！
