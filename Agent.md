# DDD オニオンアーキテクチャ実装ガイド

## アーキテクチャ概要

このプロジェクトは、ドメイン駆動設計(DDD)に基づいたオニオンアーキテクチャを採用しています。

```
┌─────────────────────────────────────┐
│      Presentation Layer             │  ← 外側
├─────────────────────────────────────┤
│      Application Layer              │
├─────────────────────────────────────┤
│      Domain Layer (Core)            │  ← 中心
├─────────────────────────────────────┤
│      Infrastructure Layer           │  ← 外側
└─────────────────────────────────────┘
```

## 各層の責務とルール

### 1. Domain Layer（ドメイン層）- `src/domain/`

**責務:**
- ビジネスロジックの中核
- エンティティ、値オブジェクト、集約の定義
- ドメインサービス、仕様パターンのインターフェース定義

**ルール:**
- ✅ 他の層に依存してはならない（完全に独立）
- ✅ フレームワークやライブラリに依存しない純粋なTypeScript
- ✅ インフラストラクチャの詳細を知らない
- ✅ 永続化方法（DB）を知らない

**ディレクトリ構造:**
```
src/domain/
├── model/
│   └── student/
│       ├── entity/           # エンティティ
│       ├── value-object/     # 値オブジェクト
│       │   └── mail-address.ts
│       └── aggregate/        # 集約ルート
└── specification/            # 仕様パターン（インターフェース）
    └── unique-student-service.ts
```

**例:**
```typescript
// ドメイン層は抽象（インターフェース）のみを定義
export interface IUniqueStudentService {
  isSatisfiedBy(mailAddress: MailAddress): Promise<boolean>;
}
```

### 2. Application Layer（アプリケーション層）- `src/application/`

**責務:**
- ユースケースの実装
- トランザクション制御
- ドメインオブジェクトの調整・オーケストレーション

**ルール:**
- ✅ Domain層に依存可能
- ✅ Infrastructure層のインターフェースに依存可能（実装には依存しない）
- ❌ Presentation層の詳細を知らない
- ✅ ビジネスロジックは書かない（ドメイン層に委譲）

**例:**
```typescript
// ユースケース例
class CreateStudentUseCase {
  constructor(
    private repository: IStudentRepository,
    private uniqueService: IUniqueStudentService
  ) {}
}
```

### 3. Infrastructure Layer（インフラストラクチャ層）- `src/infrastructure/`

**責務:**
- 外部システムとの接続（DB、API、ファイルシステム等）
- ドメイン層のインターフェース実装
- 永続化の具体的な実装

**ルール:**
- ✅ Domain層のインターフェースを実装
- ✅ 具体的な技術スタック（Drizzle ORM、PostgreSQL等）を使用
- ❌ ビジネスロジックを含まない

**ディレクトリ構造:**
```
src/infrastructure/
├── specification/            # 仕様パターンの実装
│   └── postgresql-unique-student-service.ts
├── repository/               # リポジトリの実装
└── database/                 # DB接続・スキーマ
```

**例:**
```typescript
// Domain層のインターフェースを実装
export class PostgresqlUniqueStudentService implements IUniqueStudentService {
  constructor(private readonly database: Database) {}
  
  async isSatisfiedBy(mailAddress: MailAddress): Promise<boolean> {
    // 具体的なDB実装
  }
}
```

### 4. Presentation Layer（プレゼンテーション層）

**責務:**
- HTTPリクエスト/レスポンスの処理
- 入力検証（型変換、フォーマット等）
- DTOの変換

**ルール:**
- ✅ Application層に依存可能
- ❌ ドメインオブジェクトを直接返さない（DTOに変換）
- ❌ ビジネスロジックを含まない

## 依存関係のルール

```
Presentation → Application → Domain ← Infrastructure
                              ↑
                              中心（依存されるのみ）
```

**重要原則:**
- 依存の方向は常に内側（Domain層）に向かう
- Domain層は外側の層を一切知らない
- 外側の層は内側の層に依存可能

## 実装チェックリスト

### エンティティ/値オブジェクト作成時
- [ ] `src/domain/model/` 配下に配置
- [ ] 外部ライブラリに依存していないか確認
- [ ] ビジネスルールを含んでいるか

### 仕様パターン実装時
- [ ] インターフェースは `src/domain/specification/` に配置
- [ ] 実装は `src/infrastructure/specification/` に配置
- [ ] Domain層は実装の詳細を知らない

### ユースケース作成時
- [ ] `src/application/` 配下に配置
- [ ] インターフェース経由で依存性注入
- [ ] ビジネスロジックはドメイン層に委譲

## 参考パターン

### 仕様パターン (Specification Pattern)
複雑なビジネスルールやクエリロジックをカプセル化

```typescript
// Domain層: インターフェース定義
interface IUniqueStudentService {
  isSatisfiedBy(mailAddress: MailAddress): Promise<boolean>;
}

// Infrastructure層: 実装
class PostgresqlUniqueStudentService implements IUniqueStudentService {
  // DB固有の実装
}
```

### リポジトリパターン
永続化の詳細を隠蔽し、ドメインオブジェクトの取得・保存を抽象化

---

**最終更新:** 2026-01-28