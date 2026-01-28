# API仕様検証クエリ手順書

このドキュメントは、[仕様.md](仕様.md)に記載された要件が正しく実装されているかを検証するためのcurlコマンド集です。

## 📋 現在の実装状況

| カテゴリ | 機能 | 実装状況 |
|---------|------|---------|
| 参加者 | 作成（名前・メールアドレス） | ✅ 実装済 |
| 参加者 | メールアドレス重複チェック | ✅ 実装済 |
| 参加者 | 在籍ステータス変更API | ❌ **エンドポイント未実装**（ユースケースは実装済） |
| チーム | 作成（英数字名・重複チェック） | ✅ 実装済 |
| チーム | メンバー追加/削除 | ✅ 実装済 |
| チーム | 分割/解散 | ✅ 実装済 |
| 課題進捗 | ステータス遷移 | ✅ 実装済 |
| 通知 | メール送信 | ❌ 未実装 |

---

## 🔧 検証前の準備

```bash
# APIサーバーが起動していることを確認
curl -s http://localhost:3000/students > /dev/null && echo "✅ Server is running" || echo "❌ Server is not running"
```

---

## 検証ケース1: 参加者作成（正常系）

**検証内容**: 名前とメールアドレスで参加者を作成できる

```bash
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎1", "mailAddress": "verify1@example.com"}'
```

**期待結果**: HTTP 201, 参加者情報がJSONで返却される

---

## 検証ケース2: メールアドレス重複エラー

**検証内容**: 同一メールアドレスで参加者作成時に409エラーが返る

```bash
# 1. まず参加者を作成
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎2a", "mailAddress": "verify2@example.com"}'

# 2. 同一メールアドレスで再度作成（エラーになるべき）
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎2b", "mailAddress": "verify2@example.com"}'
```

**期待結果**: HTTP 409 Conflict

---

## 検証ケース3: チーム作成（正常系）

**検証内容**: 英数字名でチームを作成できる

```bash
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam1"}'
```

**期待結果**: HTTP 201, チーム情報がJSONで返却される

---

## 検証ケース4: チーム名重複エラー

**検証内容**: 同一チーム名で作成時に409エラーが返る

```bash
# 1. まずチームを作成
curl -s -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam2"}'

# 2. 同一名で再度作成（エラーになるべき）
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam2"}'
```

**期待結果**: HTTP 409 Conflict

---

## 検証ケース5: チーム名バリデーションエラー

**検証内容**: 英数字以外の名前で400エラーが返る

```bash
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証チーム"}'
```

**期待結果**: HTTP 400 Bad Request

**注意**: 仕様では「英文字」とありますが、現在の実装は「英数字」（`[0-9A-Za-z]+`）を許容しています。

---

## 検証ケース6: チームへのメンバー追加

**検証内容**: 参加者をチームに追加できる

> **注意**: このケースはIDを使用するため、以下の手順で実行し、返却されたIDを次のコマンドに手動で入力してください。

```bash
# Step 1. 参加者を作成（返却されるIDをメモ）
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎6", "mailAddress": "verify6@example.com"}'
# → 返却された id を STUDENT_ID として使用

# Step 2. チームを作成（返却されるIDをメモ）
curl -s -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam6"}'
# → 返却された id を TEAM_ID として使用

# Step 3. メンバーを追加（IDを置き換えて実行）
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_ID}"}'
```

**期待結果**: HTTP 200, チーム情報が返却される

---

## 検証ケース7: チームからのメンバー削除

**検証内容**: チームからメンバーを削除できる

```bash
# Step 1. 参加者を2名作成
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎7a", "mailAddress": "verify7a@example.com"}'
# → STUDENT_A_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎7b", "mailAddress": "verify7b@example.com"}'
# → STUDENT_B_ID

# Step 2. チームを作成
curl -s -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam7"}'
# → TEAM_ID

# Step 3. 両方をチームに追加
curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_A_ID}"}'

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_B_ID}"}'

# Step 4. メンバーを1名削除
curl -s -w "\nHTTP Status: %{http_code}\n" -X DELETE http://localhost:3000/teams/members/{STUDENT_A_ID}
```

**期待結果**: HTTP 200

---

## 検証ケース8: チーム分割（5名以上で可能）

**検証内容**: 5名以上のチームを分割できる

```bash
# Step 1. 参加者を5名作成（各IDをメモ）
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎8-1", "mailAddress": "verify8-1@example.com"}'
# → STUDENT_1_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎8-2", "mailAddress": "verify8-2@example.com"}'
# → STUDENT_2_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎8-3", "mailAddress": "verify8-3@example.com"}'
# → STUDENT_3_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎8-4", "mailAddress": "verify8-4@example.com"}'
# → STUDENT_4_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎8-5", "mailAddress": "verify8-5@example.com"}'
# → STUDENT_5_ID

# Step 2. チームを作成
curl -s -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam8"}'
# → TEAM_ID

# Step 3. 全員をチームに追加
curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_1_ID}"}'

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_2_ID}"}'

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_3_ID}"}'

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_4_ID}"}'

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_5_ID}"}'

# Step 4. チームを分割（2名を新チームへ移動）
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/teams/{TEAM_ID}/split \
  -H "Content-Type: application/json" \
  -d '{"memberIds": ["{STUDENT_1_ID}", "{STUDENT_2_ID}"], "newTeamName": "VerifyTeam8New"}'
```

**期待結果**: HTTP 200, 新チームが作成される

---

## 検証ケース9: チーム分割エラー（4名以下）

**検証内容**: 4名以下のチームは分割できない

```bash
# Step 1. 参加者を2名作成
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎9a", "mailAddress": "verify9a@example.com"}'
# → STUDENT_A_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎9b", "mailAddress": "verify9b@example.com"}'
# → STUDENT_B_ID

# Step 2. チームを作成して2名追加
curl -s -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam9"}'
# → TEAM_ID

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_A_ID}"}'

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_B_ID}"}'

# Step 3. 分割を試みる（エラーになるべき）
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST http://localhost:3000/teams/{TEAM_ID}/split \
  -H "Content-Type: application/json" \
  -d '{"memberIds": ["{STUDENT_A_ID}"], "newTeamName": "VerifyTeam9New"}'
```

**期待結果**: HTTP 400 Bad Request

---

## 検証ケース10: チーム解散（1名チーム）

**検証内容**: 1名のチームを解散して他チームに合流できる

```bash
# Step 1. 参加者を3名作成（2名は合流先チーム用、1名は解散チーム用）
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎10a", "mailAddress": "verify10a@example.com"}'
# → STUDENT_A_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎10b", "mailAddress": "verify10b@example.com"}'
# → STUDENT_B_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎10c", "mailAddress": "verify10c@example.com"}'
# → STUDENT_C_ID

# Step 2. 合流先チームを作成（2名）
curl -s -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam10A"}'
# → TEAM_A_ID

curl -s -X POST http://localhost:3000/teams/{TEAM_A_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_A_ID}"}'

curl -s -X POST http://localhost:3000/teams/{TEAM_A_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_B_ID}"}'

# Step 3. 解散対象チームを作成（1名）
curl -s -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam10B"}'
# → TEAM_B_ID

curl -s -X POST http://localhost:3000/teams/{TEAM_B_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_C_ID}"}'

# Step 4. チームを解散
curl -s -w "\nHTTP Status: %{http_code}\n" -X DELETE http://localhost:3000/teams/{TEAM_B_ID}/disband
```

**期待結果**: HTTP 200, メンバーが他チームに合流

---

## 検証ケース11: チーム解散エラー（2名以上）

**検証内容**: 2名以上のチームは解散できない

```bash
# Step 1. 参加者を2名作成
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎11a", "mailAddress": "verify11a@example.com"}'
# → STUDENT_A_ID

curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎11b", "mailAddress": "verify11b@example.com"}'
# → STUDENT_B_ID

# Step 2. チームを作成して2名追加
curl -s -X POST http://localhost:3000/teams/new \
  -H "Content-Type: application/json" \
  -d '{"name": "VerifyTeam11"}'
# → TEAM_ID

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_A_ID}"}'

curl -s -X POST http://localhost:3000/teams/{TEAM_ID}/members/add \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_B_ID}"}'

# Step 3. 解散を試みる（エラーになるべき）
curl -s -w "\nHTTP Status: %{http_code}\n" -X DELETE http://localhost:3000/teams/{TEAM_ID}/disband
```

**期待結果**: HTTP 400 Bad Request

---

## 検証ケース12: 課題進捗ステータス遷移（正常系）

**検証内容**: 未着手→取組中→レビュー待ち→完了の順に遷移できる

> **前提**: `pnpm run seed` でレッスンマスターデータが投入済みであること

```bash
# Step 1. 参加者を作成
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎12", "mailAddress": "verify12@example.com"}'
# → STUDENT_ID

# Step 2. レッスン一覧から1つ目のレッスンIDを取得
curl -s http://localhost:3000/lessons
# → LESSON_ID（最初のレッスンのIDを使用）

# Step 3. 課題進捗を作成
curl -s -X POST http://localhost:3000/lesson-progress/new \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_ID}", "lessonId": "{LESSON_ID}"}'

# Step 4. 未着手 → 取組中
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-progress

# Step 5. 取組中 → レビュー待ち
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-review

# Step 6. レビュー待ち → 完了
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/completed
```

**期待結果**: すべてHTTP 200

---

## 検証ケース13: 課題進捗ステータス遷移エラー（未着手→完了）

**検証内容**: 未着手から直接完了には変更できない

```bash
# Step 1. 参加者を作成
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎13", "mailAddress": "verify13@example.com"}'
# → STUDENT_ID

# Step 2. レッスン一覧から2つ目のレッスンIDを取得
curl -s http://localhost:3000/lessons
# → LESSON_ID（2番目のレッスンのIDを使用）

# Step 3. 課題進捗を作成
curl -s -X POST http://localhost:3000/lesson-progress/new \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_ID}", "lessonId": "{LESSON_ID}"}'

# Step 4. 未着手 → 完了（エラーになるべき）
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/completed
```

**期待結果**: HTTP 400 Bad Request

---

## 検証ケース14: 課題進捗ステータス遷移エラー（完了→変更不可）

**検証内容**: 完了状態から他のステータスに変更できない

```bash
# Step 1. 参加者を作成
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎14", "mailAddress": "verify14@example.com"}'
# → STUDENT_ID

# Step 2. レッスン一覧から3つ目のレッスンIDを取得
curl -s http://localhost:3000/lessons
# → LESSON_ID（3番目のレッスンのIDを使用）

# Step 3. 課題進捗を作成
curl -s -X POST http://localhost:3000/lesson-progress/new \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_ID}", "lessonId": "{LESSON_ID}"}'

# Step 4. 正常に完了まで進める
curl -s -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-progress
curl -s -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-review
curl -s -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/completed

# Step 5. 完了 → 取組中（エラーになるべき）
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-progress
```

**期待結果**: HTTP 400 Bad Request

---

## 検証ケース15: レビュー待ちから差し戻し（取組中に戻る）

**検証内容**: レビュー待ちから取組中に差し戻せる

```bash
# Step 1. 参加者を作成
curl -s -X POST http://localhost:3000/students/new \
  -H "Content-Type: application/json" \
  -d '{"name": "検証太郎15", "mailAddress": "verify15@example.com"}'
# → STUDENT_ID

# Step 2. レッスン一覧から4つ目のレッスンIDを取得
curl -s http://localhost:3000/lessons
# → LESSON_ID（4番目のレッスンのIDを使用）

# Step 3. 課題進捗を作成
curl -s -X POST http://localhost:3000/lesson-progress/new \
  -H "Content-Type: application/json" \
  -d '{"studentId": "{STUDENT_ID}", "lessonId": "{LESSON_ID}"}'

# Step 4. レビュー待ちまで進める
curl -s -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-progress
curl -s -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-review

# Step 5. レビュー待ち → 取組中（差し戻し）
curl -s -w "\nHTTP Status: %{http_code}\n" -X PUT http://localhost:3000/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-progress
```

**期待結果**: HTTP 200

---

## ❌ 未実装機能（検証不可）

以下の機能はエンドポイントが未実装のため検証できません：

| 機能 | 仕様要件 | 推奨エンドポイント |
|------|---------|------------------|
| 在籍ステータス変更 | 在籍中/休会中/退会済への変更 | `PUT /students/:id/status/enrolled`<br>`PUT /students/:id/status/on-leave`<br>`PUT /students/:id/status/withdrawn` |
| 復帰時の自動チーム配属 | 休会→在籍中で最少人数チームに配属 | 上記エンドポイント内で実装 |
| メール通知 | チーム2名以下時に管理者通知 | インフラ層での実装が必要 |

---

*手順書作成日: 2026-01-28*
