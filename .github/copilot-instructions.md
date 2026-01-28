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
- リポジトリ、仕様パターンのインターフェース定義

**ルール:**
- ✅ 他の層に依存してはならない（完全に独立）
- ✅ フレームワークやライブラリに依存しない純粋なTypeScript
- ✅ インフラストラクチャの詳細を知らない
- ✅ 永続化方法（DB）を知らない

**ディレクトリ構造:**
```
src/domain/
├── model/
│   ├── __shared__/           # 基底クラス
│   │   ├── entity.ts
│   │   └── value-object.ts
│   └── student/
│       ├── student.ts        # エンティティ（集約ルート）
│       ├── student.test.ts   # テスト（コロケーション）
│       └── value-object/     # 値オブジェクト
│           ├── student-id.ts
│           ├── mail-address.ts
│           └── enrollment-status.ts
├── repository/               # リポジトリ（インターフェース）
│   └── student-repository.ts
└── specification/            # 仕様パターン（インターフェース）
    └── unique-student-service.ts
```

### 2. Application Layer（アプリケーション層）- `src/application/`

**責務:**
- ユースケースの実装
- トランザクション制御
- ドメインオブジェクトの調整・オーケストレーション
- クエリサービスのインターフェース定義（CQRS）

**ルール:**
- ✅ Domain層に依存可能
- ✅ Infrastructure層のインターフェースに依存可能（実装には依存しない）
- ❌ Presentation層の詳細を知らない
- ✅ ビジネスロジックは書かない（ドメイン層に委譲）

**ディレクトリ構造:**
```
src/application/
├── use-case/                 # コマンド系（書き込み）
│   ├── create-student-use-case.ts
│   └── errors/               # アプリケーション層エラー
│       └── mail-address-already-exists-error.ts
└── query-service/            # クエリ系（読み取り専用）
    └── student-list-query-service.ts
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
├── repository/               # リポジトリの実装
│   └── postgresql-student-repository.ts
├── specification/            # 仕様パターンの実装
│   └── postgresql-unique-student-service.ts
└── query-service/            # クエリサービスの実装
    └── postgresql-student-list-query-service.ts
```

### 4. Presentation Layer（プレゼンテーション層）- `src/presentation/`

**責務:**
- HTTPリクエスト/レスポンスの処理
- 入力検証（型変換、フォーマット等）
- DTOの変換
- 依存性の組み立て（DIコンテナなし）

**ルール:**
- ✅ Application層に依存可能
- ❌ ドメインオブジェクトを直接返さない（DTOに変換）
- ❌ ビジネスロジックを含まない

**注意:** 現在DIコンテナを使用していないため、Presentation層で具象クラスを直接インスタンス化しています。

### 5. Libs（共通ユーティリティ）- `src/libs/`

**責務:**
- 技術的なユーティリティの提供
- DB接続、ID生成などの共通機能

**ディレクトリ構造:**
```
src/libs/
├── drizzle/                  # DB関連
│   ├── get-database.ts       # DB接続
│   ├── schema.ts             # スキーマ定義
│   └── migrations/           # マイグレーション
└── ulid/                     # ID生成
    └── index.ts
```

## 依存関係のルール

```
Presentation → Application → Domain ← Infrastructure
                    ↓           ↑
              Query Service ────┘
```

**重要原則:**
- 依存の方向は常に内側（Domain層）に向かう
- Domain層は外側の層を一切知らない
- 外側の層は内側の層に依存可能

## 基底クラス

### Entity<T>
エンティティの基底クラス。IDによる同一性を持つ。

```typescript
export abstract class Entity<T> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  public equals(object?: Entity<T>): boolean {
    // IDによる等価性判定
  }
}
```

### ValueObject<T>
値オブジェクトの基底クラス。プロパティによる等価性を持ち、不変。

```typescript
export abstract class ValueObject<T extends Record<string, unknown>> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze({ ...props }); // 不変性の確保
  }

  public equals(vo?: ValueObject<T>): boolean {
    // プロパティによる等価性判定
  }
}
```

### ファクトリメソッド規約
- `create()`: 新規作成時に使用（バリデーション実行、ID自動生成）
- `reconstruct()`: DBからの復元時に使用（バリデーションスキップ可）

## 命名規則

| 種類 | パターン | ファイル名 | クラス名 |
|------|---------|-----------|---------|
| エンティティ | kebab-case / PascalCase | `student.ts` | `Student` |
| 値オブジェクト | kebab-case / PascalCase | `mail-address.ts` | `MailAddress` |
| リポジトリI/F | `I{Entity}Repository` | `student-repository.ts` | `IStudentRepository` |
| リポジトリ実装 | `Postgresql{Entity}Repository` | `postgresql-student-repository.ts` | `PostgresqlStudentRepository` |
| 仕様I/F | `I{Action}Service` | `unique-student-service.ts` | `IUniqueStudentService` |
| 仕様実装 | `Postgresql{Action}Service` | `postgresql-unique-student-service.ts` | `PostgresqlUniqueStudentService` |
| ユースケース | `{Action}{Entity}UseCase` | `create-student-use-case.ts` | `CreateStudentUseCase` |
| クエリサービスI/F | `I{Entity}ListQueryService` | `student-list-query-service.ts` | `IStudentListQueryService` |
| テストファイル | `{対象}.test.ts` | `student.test.ts` | - |

## 実装チェックリスト

### エンティティ作成時
- [ ] `src/domain/model/{entity-name}/` 配下に配置
- [ ] `Entity<T>` を継承
- [ ] `create()` と `reconstruct()` ファクトリメソッドを実装
- [ ] 外部ライブラリに依存していないか確認
- [ ] テストファイルを同階層に配置（コロケーション）

### 値オブジェクト作成時
- [ ] `src/domain/model/{entity-name}/value-object/` 配下に配置
- [ ] `ValueObject<T>` を継承
- [ ] コンストラクタでバリデーションを実行
- [ ] 不変性が保たれているか確認

### リポジトリ作成時
- [ ] インターフェースは `src/domain/repository/` に配置
- [ ] 実装は `src/infrastructure/repository/` に配置
- [ ] インターフェース名は `I{Entity}Repository`
- [ ] 実装クラス名は `Postgresql{Entity}Repository`

### 仕様パターン実装時
- [ ] インターフェースは `src/domain/specification/` に配置
- [ ] 実装は `src/infrastructure/specification/` に配置
- [ ] Domain層は実装の詳細を知らない

### ユースケース作成時
- [ ] `src/application/use-case/` 配下に配置
- [ ] インターフェース経由で依存性注入
- [ ] ビジネスロジックはドメイン層に委譲
- [ ] 入出力は専用の型（Input/Payload）を定義

## エラーハンドリング

**現在の方針:**
- アプリケーション層でエラークラスを定義・exportする
- Presentation層で `instanceof` によるエラー判定を行う

```typescript
// Application層: エラー定義
export class MailAddressAlreadyExistsError extends Error { }

// Presentation層: エラーハンドリング
if (error instanceof MailAddressAlreadyExistsError) {
  return c.json({ error: "Conflict" }, 409);
}
```

**将来の検討事項:**
Result型パターンへの移行を検討中。エラークラスをexportせず、型安全なエラーハンドリングを実現する。

```typescript
type CreateStudentResult = 
  | { success: true; payload: CreateStudentUseCasePayload }
  | { success: false; errorCode: "MAIL_ADDRESS_ALREADY_EXISTS" };
```

## 参考パターン

### リポジトリパターン
永続化の詳細を隠蔽し、ドメインオブジェクトの取得・保存を抽象化

```typescript
// Domain層: インターフェース定義
interface IStudentRepository {
  findById(id: StudentId): Promise<Student | null>;
  save(student: Student): Promise<void>;
}

// Infrastructure層: 実装
class PostgresqlStudentRepository implements IStudentRepository {
  // Drizzle ORMによる具体的なDB実装
}
```

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

### CQRSパターン（簡易版）
コマンド（書き込み）とクエリ（読み取り）を分離

- **コマンド**: Use-case → Repository → Domain Model
- **クエリ**: QueryService → DB直接（ドメインモデルを経由しない）

---

**最終更新:** 2026-01-28