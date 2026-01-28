# API検証レポート

**検証日時**: 2026年1月28日  
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
| 生徒管理 | 4 | 4 | 0 | 0 |
| チーム管理 | 7 | 5 | 1 | 1 |
| 課題進捗管理 | 5 | 5 | 0 | 0 |
| 課題管理 | 2 | 2 | 0 | 0 |
| **合計** | **18** | **16** | **1** | **1** |

---

## 3. 詳細検証結果

### 3.1 生徒管理 (Student)

| # | テスト内容 | エンドポイント | 結果 | 備考 |
|---|-----------|---------------|------|------|
| 1 | 生徒一覧取得 | `GET /students` | ✅ 成功 | 正常にJSON配列を返却 |
| 2 | 新規生徒作成 | `POST /students/new` | ✅ 成功 | ID・名前・メールアドレス・在籍状態を返却 |
| 3 | 重複メールアドレスチェック | `POST /students/new` | ✅ 成功 | 409 Conflictを返却 |
| 4 | バリデーションエラー | `POST /students/new` | ✅ 成功 | 適切なエラーメッセージを返却 |

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
| 4 | メンバー削除 | `DELETE /teams/members/:studentId` | ❌ **失敗** | 詳細は下記参照 |
| 5 | チーム分割 | `POST /teams/:teamId/split` | ✅ 成功 | 人数制限（5名以上必要）が正しく動作 |
| 6 | チーム解散 | `DELETE /teams/:teamId/disband` | ✅ 成功 | メンバーの合流先チームIDを返却 |
| 7 | チーム一覧取得 | `GET /teams` | ⚠️ 未実装 | 404 Not Found |

#### ❌ メンバー削除の失敗詳細

**リクエスト:**
```bash
DELETE /teams/members/01KG2E647H65DCTDWWRXEKKFC4
```

**レスポンス:**
```json
{"error":"Internal Server Error","message":"User is not a member of the team"}
```

**原因分析:**  
これは**コードのバグ**です。

**問題箇所:** `src/domain/model/team/team.ts` の `removeMember` メソッド

```typescript
// Line 88-90
public removeMember(studentId: StudentId): void {
  // ...
  if (!this.#studentIds.includes(studentId)) {
    throw new Error("User is not a member of the team");
  }
  // ...
}
```

**根本原因:**
- `Array.prototype.includes()` はオブジェクトの**参照比較**を行う
- `StudentId` は `ValueObject` を継承しており、同じ値でも異なるインスタンスとして扱われる
- リポジトリからTeamを取得する際に新しい `StudentId` インスタンスが生成されるため、`includes()` では一致しない

**修正案:**
```typescript
// includes の代わりに some + equals を使用
if (!this.#studentIds.some((id) => id.equals(studentId))) {
  throw new Error("User is not a member of the team");
}

// filter も同様に修正
this.#studentIds = this.#studentIds.filter((id) => !id.equals(studentId));
```

**同様のバグが存在する可能性がある箇所:**
- `addMember` メソッドの重複チェック（Line 74）
- `replaceMembers` メソッドの重複チェック（Line 96）

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

| 重要度 | 問題 | 影響範囲 | 修正優先度 |
|-------|------|---------|-----------|
| 🔴 高 | `Team.removeMember()` のStudentId比較バグ | メンバー削除が常に失敗 | 即時修正必要 |
| 🟡 中 | `Team.addMember()` のStudentId比較バグ（可能性） | 同一メンバーの重複追加チェックが機能しない可能性 | 確認・修正必要 |

### 4.2 未実装機能

| 機能 | エンドポイント | 備考 |
|------|--------------|------|
| チーム一覧取得 | `GET /teams` | 手順書で参照されていないが、管理上必要 |
| 在籍ステータス変更 | - | ユースケースは存在するがコントローラー未実装 |

### 4.3 クエリ（API仕様）の問題

特になし。手順書のAPIリクエスト仕様は正しい。

---

## 5. 推奨対応

### 即時対応（Priority: High）

1. **Team.removeMember() の修正**
   - `includes()` を `some()` + `equals()` に置き換え
   - 単体テストで値オブジェクト比較が正しく行われることを確認

2. **Team.addMember() の確認・修正**
   - 同様の問題がないか確認
   - 必要に応じて修正

### 中期対応（Priority: Medium）

3. **チーム一覧取得APIの実装**
   - `GET /teams` エンドポイントの追加
   - QueryServiceの実装

4. **在籍ステータス変更APIの実装**
   - コントローラーの追加
   - `src/index.ts` へのルート追加

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

**総合評価: 概ね良好 (88.9% 成功)**

大部分のAPIは正常に動作しています。しかし、**メンバー削除機能に致命的なバグ**があり、値オブジェクトの等値比較が正しく行われていません。このバグはドメインモデルのコード修正が必要です。

手順書（クエリ）自体には問題はなく、すべて正しいAPI仕様に基づいています。
