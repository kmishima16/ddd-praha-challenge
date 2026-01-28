#!/bin/bash
# 初期データ投入確認スクリプト
# 使用方法: bash docs/setup-commands/verify-data.sh

set -e

# 設定
DB_CONTAINER="database"
DB_USER="postgres"
DB_NAME="database"

echo "=== 初期データ確認 ==="
echo ""

# 各テーブルのレコード数を確認
echo "📊 テーブル別レコード数:"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT 'student_status' as table_name, COUNT(*) as count FROM student_status
  UNION ALL
  SELECT 'task_status', COUNT(*) FROM task_status
  UNION ALL
  SELECT 'lesson_categories', COUNT(*) FROM lesson_categories
  UNION ALL
  SELECT 'lessons', COUNT(*) FROM lessons
  UNION ALL
  SELECT 'students', COUNT(*) FROM students
  UNION ALL
  SELECT 'teams', COUNT(*) FROM teams
  ORDER BY table_name;
"

echo ""
echo "📋 student_status マスタ:"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT id, name FROM student_status ORDER BY name;
"

echo ""
echo "📋 task_status マスタ:"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT id, name FROM task_status ORDER BY name;
"

echo ""
echo "📋 lesson_categories マスタ:"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT id, name FROM lesson_categories ORDER BY name;
"

echo ""
echo "📋 lessons (カテゴリ別集計):"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT lc.name as category, COUNT(*) as lesson_count
  FROM lessons l
  JOIN lesson_categories lc ON l.lesson_category_id = lc.id
  GROUP BY lc.name
  ORDER BY lc.name;
"

echo ""
echo "✅ データ確認完了"
