# プラハチャレンジ DDD実装

ドメイン駆動設計（DDD）とオニオンアーキテクチャを採用した学習管理システムのバックエンドAPIです。


## 🚀 クイックスタート

### 前提条件

- Node.js 20.x
- pnpm 9.x
- Docker / Docker Compose

### 環境変数

プロジェクトルートに `.env` ファイルを作成し、以下の環境変数を設定してください。

```bash
# .env.example をコピー
cp .env.example .env
```

**必須の環境変数：**

```bash
DB_HOST=localhost      # PostgreSQLのホスト
DB_PORT=5432          # PostgreSQLのポート
DB_USER=postgres      # データベースユーザー名
DB_PASSWORD=password  # データベースパスワード
DB_NAME=database      # データベース名
```

> **Note:** APIサーバーは `http://localhost:3000` で起動します（環境変数での変更不可）。

### セットアップ手順

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数の設定（上記参照）
cp .env.example .env

# 3. データベースの起動（PostgreSQL 15.3 + ヘルスチェック機能付き）
docker compose up -d

# 4. マイグレーションの実行
pnpm run migration:apply

# 5. 初期データの投入（マスターデータ + レッスン）
pnpm run seed

# 6. 開発サーバーの起動
pnpm run dev
```

サーバーが `http://localhost:3000` で起動します。


## 📖 プロジェクト概要

### ドメイン概念

| 概念 | 説明 |
|------|------|
| **参加者（Student）** | 名前・メールアドレス・在籍ステータス（在籍中/休会中/退会済）を持つ |
| **チーム（Team）** | 2〜4名で構成。英字の名前を持ち、人数変動時に分割・合流が発生 |
| **課題（Lesson）** | 80種類程度。カテゴリごとに分類される |
| **課題進捗（LessonProgress）** | 参加者×課題ごとの進捗状態（未着手→取組中→レビュー待ち→完了） |

詳細な仕様は [docs/仕様.md](docs/仕様.md) を参照してください。

## 🏗 アーキテクチャ

**オニオンアーキテクチャ + CQRS パターン**を採用しています。

```
src/
├── domain/           # ドメイン層（ビジネスロジックの中核）
│   ├── model/        # エンティティ・値オブジェクト・集約
│   │   └── *.test.ts # テストファイル（コロケーション）
│   ├── repository/   # リポジトリインターフェース
│   └── specification/# 仕様パターンインターフェース
├── application/      # アプリケーション層（ユースケース）
│   ├── use-case/     # コマンド系（書き込み操作）
│   └── query-service/# クエリ系（読み取り専用・CQRS）
├── infrastructure/   # インフラストラクチャ層（永続化実装）
│   ├── repository/   # リポジトリ実装（PostgreSQL）
│   ├── specification/# 仕様パターン実装
│   └── query-service/# クエリサービス実装
├── presentation/     # プレゼンテーション層（HTTPハンドラ）
└── libs/             # 共通ユーティリティ
    ├── drizzle/      # DB接続・スキーマ・マイグレーション
    └── ulid/         # ID生成
```

**設計の特徴：**
- 依存の方向は常に内側（Domain層）に向かう
- Domain層は外部のライブラリやフレームワークに依存しない
- **CQRS**: コマンド（書き込み）とクエリ（読み取り）を明確に分離
- **テストコロケーション**: テストファイルは実装と同じディレクトリに配置

詳細なアーキテクチャガイド・実装ルールは [.github/copilot-instructions.md](.github/copilot-instructions.md) を参照してください。

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


## �💻 開発コマンド

```bash
# 開発サーバー起動（HMR対応・ポート3000）
pnpm run dev

# コード品質チェック（コミット前に必須）
pnpm run lint          # Biomeチェック + TypeScript型チェックを両方実行
pnpm run type-check    # TypeScript型チェックのみ

# テスト実行
pnpm run test          # 全テスト実行
pnpm run test:watch    # ウォッチモード

# ビルド
pnpm run build         # 本番用ビルド
pnpm run start         # ビルド後の起動

# データベース関連
pnpm run migration:generate  # マイグレーションファイル生成
pnpm run migration:apply     # マイグレーション適用
pnpm run migration:drop      # マイグレーション削除
pnpm run seed                # 初期データ投入（課題カテゴリ + 課題）
```

## 🧪 テスト

**テストフレームワーク:** Vitest

### テスト構成

- **テストコロケーション**: テストファイルは実装ファイルと同じディレクトリに配置
- **命名規則**: `*.test.ts`
- **カバレッジ**: 全てのユースケースとドメインモデルに対してテストを実装

```
src/
├── domain/model/student/
│   ├── student.ts
│   └── student.test.ts        # ← 実装と同じ場所に配置
└── application/use-case/student/
    ├── create-student-use-case.ts
    └── create-student-use-case.test.ts
```

### テスト実行

```bash
# 全テスト実行
pnpm run test

# ウォッチモード（ファイル変更時に自動実行）
pnpm run test:watch
```

設定: [vitest.config.ts](vitest.config.ts)

## 🔌 APIエンドポイント

### 参加者（Student）

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/students` | 参加者一覧取得 |
| GET | `/students/:id` | 参加者1件取得 |
| POST | `/students/new` | 参加者作成 |
| PUT | `/students/:studentId/enrollment-status/enrolled` | 在籍中に変更 |
| PUT | `/students/:studentId/enrollment-status/on-leave` | 休会中に変更 |
| PUT | `/students/:studentId/enrollment-status/withdrawn` | 退会済に変更 |

### チーム（Team）

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/teams` | チーム一覧取得 |
| GET | `/teams/:id` | チーム1件取得 |
| POST | `/teams/new` | チーム作成 |
| POST | `/teams/:teamId/members/add` | メンバー追加 |
| DELETE | `/teams/members/:studentId` | メンバー削除 |
| POST | `/teams/:teamId/split` | チーム分割 |
| DELETE | `/teams/:teamId/disband` | チーム解散 |

### 課題進捗（LessonProgress）

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/students/:studentId/lesson-progress` | 参加者別の課題進捗一覧取得 |
| GET | `/students/:studentId/lesson-progress/:lessonId` | 参加者・課題別の進捗1件取得 |
| POST | `/lesson-progress/new` | 課題進捗作成 |
| PUT | `/lesson-progress/:studentId/:lessonId/in-progress` | 取組中に変更 |
| PUT | `/lesson-progress/:studentId/:lessonId/in-review` | レビュー待ちに変更 |
| PUT | `/lesson-progress/:studentId/:lessonId/completed` | 完了に変更 |

### 課題カテゴリ（LessonCategory）

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/lesson-categories` | 課題カテゴリ一覧取得（id, name） |
| POST | `/lesson-categories/new` | 課題カテゴリ作成 |

### 課題（Lesson）

| Method | Endpoint | 説明 |
|--------|----------|------|
| GET | `/lessons` | 課題一覧取得（各件に `lessonCategoryId`, `lessonCategoryName` を含む） |
| GET | `/lessons/:id` | 課題1件取得（`lessonCategoryId`, `lessonCategoryName` を含む） |
| POST | `/lessons/new` | 課題作成 |

---

## 📖 ドキュメント

| ドキュメント | 説明 |
|------------|------|
| [アーキテクチャガイド](.github/copilot-instructions.md) | **必読**: DDD/オニオンアーキテクチャの実装ルール、命名規則、各層の責務を詳細に解説（250行以上） |
| [API リファレンス](docs/v0-api-reference.md) | フロントエンド開発者向けの詳細なAPI仕様書（TypeScript型定義・サンプルコード付き） |
| [API 検証レポート](docs/api-verification-report.md) | 全APIエンドポイントの動作検証レポート（19テストケース・全てパス） |
| [仕様書](docs/仕様.md) | ビジネス要件・ドメインルール・制約条件の詳細 |

### 推奨読解順序

1. **[仕様書](docs/仕様.md)** - ビジネス要件を理解
2. **[アーキテクチャガイド](.github/copilot-instructions.md)** - 実装ルールを把握
3. **[API リファレンス](docs/v0-api-reference.md)** - API設計を確認
4. 既存コードを読む - 実装パターンを学習

---

## ✨ ベストプラクティス

### コード品質

- ✅ **コミット前チェック必須**: `pnpm run lint` を必ず実行
- ✅ **厳格なTypeScript**: `@tsconfig/strictest` による最も厳しい型チェック
- ✅ **依存バージョン固定**: pnpmの `save-exact` で再現性を保証

### テスト

- ✅ **テストコロケーション**: テストは実装と同じディレクトリに配置
- ✅ **高いカバレッジ**: 全ユースケースとドメインモデルをテスト
- ✅ **ウォッチモード活用**: `pnpm run test:watch` で開発効率向上

### アーキテクチャ

- ✅ **CQRS分離**: コマンド（use-case）とクエリ（query-service）を明確に分離
- ✅ **依存方向の厳守**: 外側→内側（Domain層）への依存のみ許可
- ✅ **ドメイン純粋性**: Domain層は外部ライブラリに依存しない
- ✅ **インターフェース駆動**: Repository/Specificationはインターフェースを介して実装

### 開発フロー

1. 仕様書・アーキテクチャガイドを確認
2. 既存の似た実装を参考にする
3. テストを書きながら実装（TDD推奨）
4. `pnpm run lint` でコード品質チェック
5. `pnpm run test` で全テスト実行
6. コミット

詳細は [.github/copilot-instructions.md](.github/copilot-instructions.md) を参照してください。
