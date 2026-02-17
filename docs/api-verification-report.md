# API検証レポート

**検証日時**: 2026年1月28日  
**最終更新**: 2026年2月（実装・修正反映）  
**検証者**: Copilot  
**検証対象**: DDD Praha Challenge Web API

---

## 1. 検証概要

稼働中のAPIに対して、確認手順書（`docs/setup-commands/api-test.sh`）に基づいた動作検証を実施しました。

### 検証環境
- APIサーバー: `http://localhost:3000`
- データベース: PostgreSQL (Docker)
- マスターデータ: seed済み

---

## 2. 検証結果サマリー

| カテゴリ | テスト項目数 | 成功 | 失敗 | 未実装 |
|---------|------------|------|------|--------|
| 生徒管理 | 5 | 5 | 0 | 0 |
| チーム管理 | 7 | 7 | 0 | 0 |
| 課題進捗管理 | 5 | 5 | 0 | 0 |
| 課題管理 | 2 | 2 | 0 | 0 |
| **合計** | **19** | **19** | **0** | **0** |

---

## 3. 詳細検証結果

### 3.1 生徒管理 (Student)

| # | テスト内容 | エンドポイント | 結果 | 備考 |
|---|-----------|---------------|------|------|
| 1 | 生徒一覧取得 | `GET /students` | ✅ 成功 | 正常にJSON配列を返却 |
| 2 | 新規生徒作成 | `POST /students/new` | ✅ 成功 | ID・名前・メールアドレス・在籍状態を返却 |
| 3 | 重複メールアドレスチェック | `POST /students/new` | ✅ 成功 | 409 Conflictを返却 |
| 4 | バリデーションエラー | `POST /students/new` | ✅ 成功 | 適切なエラーメッセージを返却 |
| 5 | 在籍ステータス変更 | `PUT /students/:studentId/enrollment-status/{enrolled,on-leave,withdrawn}` | ✅ 成功 | 在籍中・休会中・退会済への変更が可能（実装済み） |

**作成された生徒一覧:**
```json
[
  {"id":"01KG2E6463X0BCGY6GGG0DRRZ2","name":"田中太郎","mailAddress":"tanaka@example.com","enrollmentStatus":"ENROLLED"},
  {"id":"01KG2E647H65DCTDWWRXEKKFC4","name":"山田花子","mailAddress":"yamada@example.com","enrollmentStatus":"ENROLLED"},
  {"id":"01KG2E648K3F76NDHQ26NAGCAV","name":"鈴木一郎","mailAddress":"suzuki@example.com","enrollmentStatus":"ENROLLED"},
  {"id":"01KG2E649NFPSCPQ4H5N8RFWTP","name":"佐藤美咲","mailAddress":"sato@example.com","enrollmentStatus":"ENROLLED"},
  {"id":"01KG2E64AVV40MGDG6MX6MHT4Y","name":"高橋健太","mailAddress":"takahashi@example.com","enrollmentStatus":"ENROLLED"}
]
```

---

### 3.2 チーム管理 (Team)

| # | テスト内容 | エンドポイント | 結果 | 備考 |
|---|-----------|---------------|------|------|
| 1 | チーム作成 | `POST /teams/new` | ✅ 成功 | ID・名前・memberIdsを返却 |
| 2 | 重複チーム名チェック | `POST /teams/new` | ✅ 成功 | 409 Conflictを返却 |
| 3 | メンバー追加 | `POST /teams/:teamId/members/add` | ✅ 成功 | teamId・studentIdを返却 |
| 4 | メンバー削除 | `DELETE /teams/members/:studentId` | ✅ 成功 | 値オブジェクト比較を `equals` に修正済み（コミット d92bd08） |
| 5 | チーム分割 | `POST /teams/:teamId/split` | ✅ 成功 | 人数制限（5名以上必要）が正しく動作 |
| 6 | チーム解散 | `DELETE /teams/:teamId/disband` | ✅ 成功 | メンバーの合流先チームIDを返却 |
| 7 | チーム一覧取得 | `GET /teams` | ✅ 成功 | 実装済み（コミット 28ea359） |

#### メンバー削除について（修正済み）

以前は `Team.removeMember()` で `Array.prototype.includes()` による参照比較のためメンバー削除が失敗していました。値オブジェクトの等値比較に `some()` + `equals()` を使用するよう修正済みです（コミット d92bd08）。`addMember` の重複チェックも同様に修正済みです。

---

### 3.3 課題進捗管理 (Lesson Progress)

| # | テスト内容 | エンドポイント | 結果 | 備考 |
|---|-----------|---------------|------|------|
| 1 | 課題進捗作成 | `POST /lesson-progress/new` | ✅ 成功 | 初期状態は `NOT_STARTED` |
| 2 | 取組中に変更 | `PUT /lesson-progress/:studentId/:lessonId/in-progress` | ✅ 成功 | |
| 3 | レビュー待ちに変更 | `PUT /lesson-progress/:studentId/:lessonId/in-review` | ✅ 成功 | |
| 4 | 完了に変更 | `PUT /lesson-progress/:studentId/:lessonId/completed` | ✅ 成功 | |
| 5 | 不正な状態遷移の拒否 | `PUT /lesson-progress/:studentId/:lessonId/in-progress` | ✅ 成功 | 完了→取組中は 400 Bad Request |

**状態遷移テスト:**
```
NOT_STARTED → IN_PROGRESS → IN_REVIEW → COMPLETED
```

**不正遷移テスト（完了→取組中）:**
```json
{"error":"Bad Request","message":"Cannot change status to IN_PROGRESS from COMPLETED"}
```

---

### 3.4 課題管理 (Lesson)

| # | テスト内容 | エンドポイント | 結果 | 備考 |
|---|-----------|---------------|------|------|
| 1 | 課題作成 | `POST /lessons/new` | ✅ 成功 | |
| 2 | バリデーションエラー | `POST /lessons/new` | ✅ 成功 | 必須項目欠落時に適切なエラーを返却 |

---

## 4. 問題分類

### 4.1 コードのバグ

| 重要度 | 問題 | 状態 |
|-------|------|------|
| 🔴 高 | `Team.removeMember()` のStudentId比較バグ | ✅ 対応済み（コミット d92bd08） |
| 🟡 中 | `Team.addMember()` のStudentId比較バグ（可能性） | ✅ 対応済み（同上） |

### 4.2 未実装機能

| 機能 | エンドポイント | 状態 |
|------|--------------|------|
| チーム一覧取得 | `GET /teams` | ✅ 実装済み（コミット 28ea359） |
| 在籍ステータス変更 | `PUT /students/:id/enrollment-status/enrolled`, `on-leave`, `withdrawn` | ✅ 実装済み（コミット 3781aa8） |

### 4.3 クエリ（API仕様）の問題

特になし。手順書のAPIリクエスト仕様は正しい。

---

## 5. 推奨対応

### 即時対応（Priority: High）— 対応済み

1. **Team.removeMember() の修正** — ✅ 対応済み（コミット d92bd08）
2. **Team.addMember() の確認・修正** — ✅ 対応済み（同上）

### 中期対応（Priority: Medium）— 対応済み

3. **チーム一覧取得APIの実装** — ✅ 対応済み（コミット 28ea359）
4. **在籍ステータス変更APIの実装** — ✅ 対応済み（コミット 3781aa8）

### 長期対応（Priority: Low）

5. **ValueObject比較のユーティリティ追加検討**
   - 配列内の値オブジェクト検索用のヘルパーメソッド
   - 例: `StudentIdList` のようなファーストクラスコレクション

---

## 6. マスターデータ確認

| テーブル | 件数 | 状態 |
|---------|------|------|
| student_status | 3 | ✅ OK |
| task_status | 4 | ✅ OK |
| lesson_categories | 8 | ✅ OK |
| lessons | 71 | ✅ OK |

---

## 7. 最終データ状態

### チーム状況
| チームID | チーム名 | メンバー |
|---------|---------|---------|
| 01KG2EA0J6HPAPTZW53ZGVAX45 | TeamA | 田中太郎, 山田花子 |
| 01KG2FQE53EZQKB5XWHKH89SRW | TestTeam | 鈴木一郎 |
| 01KG2FQK4JZVATGDBXXCVH4FMK | a | （メンバーなし） |

※ TeamB は解散テストにより削除済み

---

## 8. 結論

**総合評価: 全項目成功 (100%)**

検証対象19項目はすべて成功しています。以前報告していたメンバー削除の致命的なバグ（値オブジェクトの等値比較）は修正済みです（コミット d92bd08）。チーム一覧取得（GET /teams）および在籍ステータス変更APIも実装済みです。

手順書（クエリ）自体には問題はなく、すべて正しいAPI仕様に基づいています。

---

## 9. フロントエンド動作確認に必要なエンドポイント（仕様との対応）

[仕様.md](仕様.md) の概念に沿い、フロントエンドで動作確認する際に利用できる**現在公開されているエンドポイント**を一覧し、不足があれば記載します。

### 9.1 公開エンドポイント一覧（存在チェック済み）

以下はすべて `src/index.ts` にマウントされており利用可能です。

| 仕様の概念 | Method | Endpoint | 説明 | 状態 |
|-----------|--------|----------|------|------|
| **参加者** | GET | `/students` | 参加者一覧 | ✅ あり |
| **参加者** | GET | `/students/:id` | 参加者1件取得 | ✅ あり |
| **参加者** | POST | `/students/new` | 参加者作成 | ✅ あり |
| **参加者** | PUT | `/students/:studentId/enrollment-status/enrolled` | 在籍中に変更 | ✅ あり |
| **参加者** | PUT | `/students/:studentId/enrollment-status/on-leave` | 休会中に変更 | ✅ あり |
| **参加者** | PUT | `/students/:studentId/enrollment-status/withdrawn` | 退会済に変更 | ✅ あり |
| **チーム** | GET | `/teams` | チーム一覧 | ✅ あり |
| **チーム** | GET | `/teams/:id` | チーム1件取得 | ✅ あり |
| **チーム** | POST | `/teams/new` | チーム作成 | ✅ あり |
| **チーム** | POST | `/teams/:teamId/members/add` | メンバー追加 | ✅ あり |
| **チーム** | DELETE | `/teams/members/:studentId` | メンバー削除 | ✅ あり |
| **チーム** | POST | `/teams/:teamId/split` | チーム分割 | ✅ あり |
| **チーム** | DELETE | `/teams/:teamId/disband` | チーム解散 | ✅ あり |
| **課題** | GET | `/lessons` | 課題一覧 | ✅ あり |
| **課題** | GET | `/lessons/:id` | 課題1件取得 | ✅ あり |
| **課題** | POST | `/lessons/new` | 課題作成 | ✅ あり |
| **課題進捗** | GET | `/students/:studentId/lesson-progress` | 参加者別の課題進捗一覧 | ✅ あり |
| **課題進捗** | GET | `/students/:studentId/lesson-progress/:lessonId` | 参加者・課題別の進捗1件 | ✅ あり |
| **課題進捗** | POST | `/lesson-progress/new` | 課題進捗作成 | ✅ あり |
| **課題進捗** | PUT | `/lesson-progress/:studentId/:lessonId/in-progress` | 取組中に変更 | ✅ あり |
| **課題進捗** | PUT | `/lesson-progress/:studentId/:lessonId/in-review` | レビュー待ちに変更 | ✅ あり |
| **課題進捗** | PUT | `/lesson-progress/:studentId/:lessonId/completed` | 完了に変更 | ✅ あり |

### 9.2 仕様で触れられているが未公開のもの

| 内容 | 備考 |
|------|------|
| **課題カテゴリ一覧** | 仕様では「課題はカテゴリごとに分類」。`GET /lesson-categories` は未実装。フロントでカテゴリ名ラベルを出す場合は、現状は `GET /lessons/:id` の `lessonCategoryId` のみ取得可能で、カテゴリ名は別途マスタを持るか、API拡張が必要。 |
| **課題一覧のカテゴリID** | `GET /lessons` のレスポンスには `lessonCategoryId` が含まれていない（id, name, content のみ）。カテゴリ別に課題を並べる場合は、`GET /lessons/:id` で1件ずつ取得するか、`GET /lessons` のレスポンスに `lessonCategoryId` を追加する拡張があるとよい。 |
| **課題カテゴリ作成** | `POST /lesson-categories/new` のコントローラーは実装済みだが、`src/index.ts` にルートが未マウントのため未公開。 |

### 9.3 フロントエンド動作確認の進め方

- **参加者・チーム・課題進捗**: 上記の公開エンドポイントだけで、仕様に記載された一覧・作成・取得・ステータス変更・チーム操作はすべて動作確認可能です。
- **在籍ステータス・進捗ステータスの表示**: API は `ENROLLED` / `NOT_STARTED` / `IN_PROGRESS` などの文字列を返すため、フロントではそのまま表示するか、固定のラベルマッピングで対応できます。マスタ用の別エンドポイントは必須ではありません。
- **課題をカテゴリごとに表示したい場合**: 現状は `GET /lessons` に `lessonCategoryId` が無いため、カテゴリ別表示には (1) 各課題を `GET /lessons/:id` で取得して `lessonCategoryId` を集める、または (2) バックエンドで `GET /lessons` のレスポンスに `lessonCategoryId` を追加する、のいずれかが必要です。
