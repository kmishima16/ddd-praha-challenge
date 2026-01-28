#!/bin/bash
# APIテスト用スクリプト
# 使用方法: bash docs/setup-commands/api-test.sh
#
# 前提条件:
# - pnpm run seed でマスターデータが投入済み
# - pnpm run dev でAPIサーバーが起動中 (localhost:3000)

set -e

# 設定
BASE_URL="http://localhost:3000"

# 色付き出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== API動作テスト ===${NC}"
echo ""

# ヘルパー関数
test_api() {
  local method="$1"
  local endpoint="$2"
  local data="$3"
  local description="$4"
  
  echo -e "${YELLOW}▶ ${description}${NC}"
  echo "  ${method} ${endpoint}"
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "${BASE_URL}${endpoint}" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "${BASE_URL}${endpoint}")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [[ "$http_code" =~ ^2 ]]; then
    echo -e "  ${GREEN}✓ HTTP $http_code${NC}"
    echo "  Response: $body"
  else
    echo -e "  ${RED}✗ HTTP $http_code${NC}"
    echo "  Response: $body"
  fi
  echo ""
}

# ========================================
# 1. 一覧取得テスト
# ========================================
echo -e "${BLUE}--- 1. 一覧取得テスト ---${NC}"
echo ""

test_api "GET" "/students" "" "生徒一覧を取得"

# ========================================
# 2. 生徒作成テスト
# ========================================
echo -e "${BLUE}--- 2. 生徒作成テスト ---${NC}"
echo ""

# 生徒1を作成
STUDENT1_DATA='{"name": "田中太郎", "mailAddress": "tanaka@example.com"}'
test_api "POST" "/students/new" "$STUDENT1_DATA" "生徒1を作成（田中太郎）"

# 生徒2を作成
STUDENT2_DATA='{"name": "山田花子", "mailAddress": "yamada@example.com"}'
test_api "POST" "/students/new" "$STUDENT2_DATA" "生徒2を作成（山田花子）"

# 生徒3を作成
STUDENT3_DATA='{"name": "鈴木一郎", "mailAddress": "suzuki@example.com"}'
test_api "POST" "/students/new" "$STUDENT3_DATA" "生徒3を作成（鈴木一郎）"

# 生徒4を作成
STUDENT4_DATA='{"name": "佐藤美咲", "mailAddress": "sato@example.com"}'
test_api "POST" "/students/new" "$STUDENT4_DATA" "生徒4を作成（佐藤美咲）"

# 生徒5を作成
STUDENT5_DATA='{"name": "高橋健太", "mailAddress": "takahashi@example.com"}'
test_api "POST" "/students/new" "$STUDENT5_DATA" "生徒5を作成（高橋健太）"

# 作成後の一覧を確認
test_api "GET" "/students" "" "生徒一覧を再取得"

# ========================================
# 3. チーム作成テスト
# ========================================
echo -e "${BLUE}--- 3. チーム作成テスト ---${NC}"
echo ""

TEAM1_DATA='{"name": "TeamA"}'
test_api "POST" "/teams/new" "$TEAM1_DATA" "チーム1を作成（TeamA）"

TEAM2_DATA='{"name": "TeamB"}'
test_api "POST" "/teams/new" "$TEAM2_DATA" "チーム2を作成（TeamB）"

# ========================================
# 4. 手動でIDを取得してテスト
# ========================================
echo -e "${BLUE}--- 4. 追加のAPIテスト（IDが必要なもの） ---${NC}"
echo ""
echo -e "${YELLOW}以下のテストは、上記で作成したリソースのIDを使用してください${NC}"
echo ""

echo "# チームにメンバーを追加する例:"
echo 'curl -X POST "${BASE_URL}/teams/{TEAM_ID}/members/add" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '\''{"studentId": "{STUDENT_ID}"}'\'''
echo ""

echo "# チームからメンバーを削除する例:"
echo 'curl -X DELETE "${BASE_URL}/teams/members/{STUDENT_ID}"'
echo ""

echo "# 課題進捗を「着手中」に変更する例:"
echo 'curl -X PUT "${BASE_URL}/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-progress"'
echo ""

echo "# 課題進捗を「レビュー待ち」に変更する例:"
echo 'curl -X PUT "${BASE_URL}/lesson-progress/{STUDENT_ID}/{LESSON_ID}/in-review"'
echo ""

echo "# 課題進捗を「完了」に変更する例:"
echo 'curl -X PUT "${BASE_URL}/lesson-progress/{STUDENT_ID}/{LESSON_ID}/completed"'
echo ""

# ========================================
# 5. インタラクティブテスト用の便利関数
# ========================================
echo -e "${BLUE}--- 5. インタラクティブテスト用コマンド ---${NC}"
echo ""

cat << 'EOF'
# 以下のコマンドをコピーして個別にテストできます

# 環境変数の設定
export BASE_URL="http://localhost:3000"

# 生徒作成
curl -X POST "${BASE_URL}/students/new" \
  -H "Content-Type: application/json" \
  -d '{"name": "テスト太郎", "mailAddress": "test@example.com"}'

# 生徒一覧取得
curl "${BASE_URL}/students" | jq

# チーム作成
curl -X POST "${BASE_URL}/teams/new" \
  -H "Content-Type: application/json" \
  -d '{"name": "TestTeam"}'

# チームにメンバー追加 (IDは適宜変更)
# curl -X POST "${BASE_URL}/teams/TEAM_ID/members/add" \
#   -H "Content-Type: application/json" \
#   -d '{"studentId": "STUDENT_ID"}'

# チームからメンバー削除 (IDは適宜変更)
# curl -X DELETE "${BASE_URL}/teams/members/STUDENT_ID"

# チーム分割 (5名以上のチームで実行可能)
# curl -X POST "${BASE_URL}/teams/TEAM_ID/split" \
#   -H "Content-Type: application/json" \
#   -d '{"memberIds": ["ID1", "ID2"], "newTeamName": "NewTeam"}'

# チーム解散 (1名のチームで実行可能)
# curl -X DELETE "${BASE_URL}/teams/TEAM_ID/disband"

# 課題進捗を変更
# curl -X PUT "${BASE_URL}/lesson-progress/STUDENT_ID/LESSON_ID/in-progress"
# curl -X PUT "${BASE_URL}/lesson-progress/STUDENT_ID/LESSON_ID/in-review"
# curl -X PUT "${BASE_URL}/lesson-progress/STUDENT_ID/LESSON_ID/completed"
EOF

echo ""
echo -e "${GREEN}=== テスト完了 ===${NC}"
