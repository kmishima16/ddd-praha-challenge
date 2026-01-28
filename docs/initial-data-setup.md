# 初期データセットアップ手順

このドキュメントでは、APIサーバーの動作テストに必要な初期データのセットアップ手順を説明します。

## 前提条件

1. **Dockerが起動していること**
   ```bash
   docker compose up -d
   ```

2. **データベースマイグレーションが完了していること**
   ```bash
   pnpm run db:migrate
   ```

3. **APIサーバーが起動していること**（APIテスト時のみ）
   ```bash
   pnpm run dev
   ```

## セットアップ手順

### Step 1: マスターデータの投入

以下のコマンドでマスターデータを投入します：

```bash
pnpm run seed
```

このコマンドで投入されるデータ：

| テーブル | レコード数 | 内容 |
|---------|-----------|------|
| `student_status` | 3 | ENROLLED, ON_LEAVE, WITHDRAWN |
| `task_status` | 4 | NOT_STARTED, IN_PROGRESS, IN_REVIEW, COMPLETED |
| `lesson_categories` | 8 | データベース, テスト, 設計, フロントエンド, Web基礎, 開発プラクティス, インフラ, 実践課題 |
| `lessons` | 69 | 全レッスン（カテゴリ別に分類） |

**注意**: seedスクリプトは冪等性を持っているため、複数回実行しても既存データは上書きされません。

### Step 2: データ投入の確認

投入されたデータを確認するには：

```bash
# docs/setup-commands/verify-data.sh を実行
bash docs/setup-commands/verify-data.sh
```

または、psqlで直接確認：

```bash
docker compose exec database psql -U postgres -d database -c "
  SELECT 'student_status' as table_name, COUNT(*) as count FROM student_status
  UNION ALL
  SELECT 'task_status', COUNT(*) FROM task_status
  UNION ALL
  SELECT 'lesson_categories', COUNT(*) FROM lesson_categories
  UNION ALL
  SELECT 'lessons', COUNT(*) FROM lessons;
"
```

### Step 3: APIテストの実行

APIの動作確認を行うには：

```bash
# docs/setup-commands/api-test.sh を実行
bash docs/setup-commands/api-test.sh
```

このスクリプトでは以下のテストを実行します：
- 生徒（Student）の作成
- チーム（Team）の作成
- チームへのメンバー追加
- 課題進捗（Lesson Progress）の状態変更

## トラブルシューティング

### seedが失敗する場合

1. **データベース接続エラー**
   - `.env`ファイルにDB接続情報が設定されているか確認
   - Dockerコンテナが起動しているか確認

2. **テーブルが存在しないエラー**
   - マイグレーションを実行: `pnpm run db:migrate`

3. **外部キー制約エラー**
   - 通常は発生しませんが、手動でデータを削除した場合に起こる可能性があります
   - データベースをリセット: `pnpm run db:reset`（存在する場合）

### APIテストが失敗する場合

1. **接続拒否エラー**
   - APIサーバーが起動しているか確認: `pnpm run dev`
   - ポート3000が使用可能か確認

2. **404エラー**
   - エンドポイントのパスを確認

## カテゴリ別レッスン一覧

### データベース（23レッスン）
- データベースモデリング1〜5
- データベース設計のアンチパターンを学ぶ1〜9
- アンチパターンを踏まえてDBモデリングを見直そう
- マルチテナントについて
- 外部キー制約について考える
- データベースにおけるNULLの扱い
- SQL10本ノック
- インデックスを理解する
- スロークエリを理解する
- ビューを使いこなす
- トランザクションについて理解する

### テスト（5レッスン）
- jestで単体テストを書こう
- Storybookでコンポーネントの動作確認をしよう
- ビジュアルリグレッションテストを書こう
- E2Eテストを書こう
- TDD(テスト駆動開発)でコードを書いてみる

### 設計（6レッスン）
- 基本的な設計原則
- オニオンアーキテクチャを学ぶ
- DDDを学ぶ（基礎）
- 特大課題：プラハチャレンジをDDDで実装してみる
- DDDを学ぶ（応用）
- リファクタリング

### フロントエンド（10レッスン）
- Reactの開発環境を立ち上げよう
- Webページを作ってみよう
- Webページをコンポーネントに分割してみよう
- 汎用的なコンポーネントを作成しよう【props編】
- 汎用的なコンポーネントを作成しよう【CSS編】
- Reactに入門しよう【レンダリング編】
- Reactに入門しよう【状態管理編】
- Reactに入門しよう【避難ハッチ編】
- フロントエンドのレンダリングパターンを学ぼう【CSR、SSR、SSG】
- ライブラリを使ってみよう

### Web基礎（8レッスン）
- よく使うHTTPヘッダを理解する
- curlとpostmanに慣れる
- リクエストをパースするWEBサーバを作ってみる
- Cookieを理解する
- サードパーティCookieについて理解する
- CORSについて理解する
- キャッシュについて理解する
- WEBサービスの代表的な脆弱性を理解する

### 開発プラクティス（6レッスン）
- リンターを使おう
- CI環境を整備してみよう
- チーム開発を円滑にするコツを覚えよう
- ブランチ戦略を学ぼう
- アジャイル開発を学ぼう
- Gitの便利コマンドを覚える

### インフラ（9レッスン）
- 安全なIAMの設計を理解する
- マルチAZに跨るVPCを構築する
- 冗長化されたWebアプリケーションを作ってみよう
- S3を理解する
- CDN(CloudFront)について理解して使ってみよう
- ログの取り方を学ぼう
- 本番稼働中のデータベースをマイグレーションしよう
- サービスのモニタリングを考える
- Dockerで環境差分を吸収する

### 実践課題（4レッスン）
- 外部APIを活用してみよう
- MVP用フロントエンドを実装してみよう
- ログイン機能を実装してみよう
- BaaSを利用してバックエンドを実装・デプロイしてみよう
