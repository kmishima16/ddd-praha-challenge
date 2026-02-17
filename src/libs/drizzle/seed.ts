import "dotenv/config";

import { and, asc, eq, inArray } from "drizzle-orm";
import { ulid } from "../ulid";
import { getDatabase } from "./get-database";
import {
  lessonCategories,
  lessons,
  studentStatus,
  studentTasks,
  students,
  taskStatus,
  teams,
  users,
} from "./schema";

/**
 * マスターデータのシード投入
 * 冪等性を保つため、既に存在する場合は何もしない
 */
async function seed() {
  const db = getDatabase();

  console.log("🌱 Seeding master data...");

  // student_status マスタ
  const studentStatusData = [
    { id: ulid(), name: "ENROLLED" },
    { id: ulid(), name: "ON_LEAVE" },
    { id: ulid(), name: "WITHDRAWN" },
  ] as const;

  for (const status of studentStatusData) {
    await db
      .insert(studentStatus)
      .values(status)
      .onConflictDoNothing({ target: studentStatus.name });
  }

  console.log("✅ student_status: 3 records");

  // task_status マスタ
  const taskStatusData = [
    { id: ulid(), name: "NOT_STARTED" },
    { id: ulid(), name: "IN_PROGRESS" },
    { id: ulid(), name: "IN_REVIEW" },
    { id: ulid(), name: "COMPLETED" },
  ] as const;

  for (const status of taskStatusData) {
    await db
      .insert(taskStatus)
      .values(status)
      .onConflictDoNothing({ target: taskStatus.name });
  }

  console.log("✅ task_status: 4 records");

  // lesson_categories マスタ
  const categoryIds = {
    database: ulid(),
    test: ulid(),
    design: ulid(),
    frontend: ulid(),
    webBasics: ulid(),
    devPractice: ulid(),
    infrastructure: ulid(),
    practice: ulid(),
  };

  const lessonCategoriesData = [
    { id: categoryIds.database, name: "データベース" },
    { id: categoryIds.test, name: "テスト" },
    { id: categoryIds.design, name: "設計" },
    { id: categoryIds.frontend, name: "フロントエンド" },
    { id: categoryIds.webBasics, name: "Web基礎" },
    { id: categoryIds.devPractice, name: "開発プラクティス" },
    { id: categoryIds.infrastructure, name: "インフラ" },
    { id: categoryIds.practice, name: "実践課題" },
  ] as const;

  for (const category of lessonCategoriesData) {
    await db
      .insert(lessonCategories)
      .values(category)
      .onConflictDoNothing({ target: lessonCategories.name });
  }

  console.log("✅ lesson_categories: 8 records");

  // DBから実際のカテゴリIDを取得（冪等性のため）
  const [dbDatabase] = await db
    .select()
    .from(lessonCategories)
    .where(eq(lessonCategories.name, "データベース"));
  const [dbTest] = await db
    .select()
    .from(lessonCategories)
    .where(eq(lessonCategories.name, "テスト"));
  const [dbDesign] = await db
    .select()
    .from(lessonCategories)
    .where(eq(lessonCategories.name, "設計"));
  const [dbFrontend] = await db
    .select()
    .from(lessonCategories)
    .where(eq(lessonCategories.name, "フロントエンド"));
  const [dbWebBasics] = await db
    .select()
    .from(lessonCategories)
    .where(eq(lessonCategories.name, "Web基礎"));
  const [dbDevPractice] = await db
    .select()
    .from(lessonCategories)
    .where(eq(lessonCategories.name, "開発プラクティス"));
  const [dbInfrastructure] = await db
    .select()
    .from(lessonCategories)
    .where(eq(lessonCategories.name, "インフラ"));
  const [dbPractice] = await db
    .select()
    .from(lessonCategories)
    .where(eq(lessonCategories.name, "実践課題"));

  const actualCategoryIds = {
    database: dbDatabase?.id ?? categoryIds.database,
    test: dbTest?.id ?? categoryIds.test,
    design: dbDesign?.id ?? categoryIds.design,
    frontend: dbFrontend?.id ?? categoryIds.frontend,
    webBasics: dbWebBasics?.id ?? categoryIds.webBasics,
    devPractice: dbDevPractice?.id ?? categoryIds.devPractice,
    infrastructure: dbInfrastructure?.id ?? categoryIds.infrastructure,
    practice: dbPractice?.id ?? categoryIds.practice,
  };

  // lessons マスタ
  const lessonsData = [
    // データベース (19レッスン)
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベースモデリング1",
      content: "データベース設計の基礎となるER図の書き方と正規化を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベースモデリング2",
      content: "実践的なテーブル設計とリレーションの定義方法を習得します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベースモデリング3",
      content: "複雑なビジネス要件をデータモデルに落とし込む手法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベースモデリング4",
      content: "パフォーマンスを考慮したインデックス設計の基礎を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベースモデリング5",
      content: "スケーラビリティを意識したデータベース設計手法を習得します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ1",
      content: "ジェイウォークやEAVなど代表的なアンチパターンを理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ2",
      content: "マジックナンバーやメタデータトリブルの問題点を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ3",
      content: "ポリモーフィック関連の落とし穴と対処法を理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ4",
      content: "マルチカラムアトリビュートの問題と正しい設計を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ5",
      content: "ナイーブツリーと隣接リストモデルの比較検討を行います",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ6",
      content: "IDリクワイアドとシュードキーニートフリークを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ7",
      content: "インデックスショットガンとプアマンズサーチを理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ8",
      content: "スパゲッティクエリの問題点と分割方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベース設計のアンチパターンを学ぶ9",
      content: "インプリシットカラムとフィアオブジアンノウンを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "アンチパターンを踏まえてDBモデリングを見直そう",
      content: "学んだアンチパターンを元に既存設計を改善する実践演習です",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "マルチテナントについて",
      content: "SaaSで重要なマルチテナントのDB設計パターンを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "外部キー制約について考える",
      content: "外部キー制約のメリットデメリットと運用方法を考察します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "データベースにおけるNULLの扱い",
      content: "NULLの3値論理や実務での扱い方のベストプラクティスを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "SQL10本ノック",
      content: "実践的なSQLクエリを10問解いてSQL力を鍛えます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "インデックスを理解する",
      content: "B-treeインデックスの仕組みと効果的な設計方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "スロークエリを理解する",
      content: "スロークエリの特定方法と改善アプローチを習得します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "ビューを使いこなす",
      content: "ビューの活用方法とマテリアライズドビューの使い分けを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.database,
      name: "トランザクションについて理解する",
      content: "ACID特性と分離レベルの違いを実例を通じて理解します",
    },
    // テスト (5レッスン)
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.test,
      name: "jestで単体テストを書こう",
      content: "Jestを使った単体テストの書き方とモックの活用法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.test,
      name: "Storybookでコンポーネントの動作確認をしよう",
      content:
        "Storybookでコンポーネントをカタログ化し動作確認する方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.test,
      name: "ビジュアルリグレッションテストを書こう",
      content: "UIの見た目の変化を自動検知するVRTの導入方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.test,
      name: "E2Eテストを書こう",
      content: "PlaywrightやCypressを使ったE2Eテストの実装方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.test,
      name: "TDD(テスト駆動開発)でコードを書いてみる",
      content: "Red-Green-Refactorサイクルで開発する手法を実践します",
    },
    // 設計 (5レッスン)
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.design,
      name: "基本的な設計原則",
      content: "SOLID原則やDRYなど基本的な設計原則を理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.design,
      name: "オニオンアーキテクチャを学ぶ",
      content: "依存関係逆転を活用したオニオンアーキテクチャを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.design,
      name: "DDDを学ぶ（基礎）",
      content: "エンティティ、値オブジェクト、集約などDDDの基礎概念を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.design,
      name: "特大課題：プラハチャレンジをDDDで実装してみる",
      content: "学んだDDDの知識を総動員してアプリケーションを実装します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.design,
      name: "DDDを学ぶ（応用）",
      content: "ドメインイベントやCQRSなどDDDの応用パターンを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.design,
      name: "リファクタリング",
      content:
        "コードの振る舞いを変えずに設計を改善するリファクタリング技法を学びます",
    },
    // フロントエンド (10レッスン)
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "Reactの開発環境を立ち上げよう",
      content: "ViteやCreate React Appを使った環境構築方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "Webページを作ってみよう",
      content: "HTML/CSSの基礎からシンプルなWebページを作成します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "Webページをコンポーネントに分割してみよう",
      content: "再利用可能なコンポーネント設計の考え方を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "汎用的なコンポーネントを作成しよう【props編】",
      content: "propsを活用した柔軟なコンポーネント設計を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "汎用的なコンポーネントを作成しよう【CSS編】",
      content: "CSS-in-JSやCSS Modulesを使ったスタイリング手法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "Reactに入門しよう【レンダリング編】",
      content: "ReactのレンダリングサイクルとVirtual DOMの仕組みを理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "Reactに入門しよう【状態管理編】",
      content: "useStateやuseReducerを使った状態管理の基礎を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "Reactに入門しよう【避難ハッチ編】",
      content:
        "useRefやuseEffectなどReactの避難ハッチを適切に使う方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "フロントエンドのレンダリングパターンを学ぼう【CSR、SSR、SSG】",
      content: "CSR/SSR/SSGの違いと適切な使い分けを理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.frontend,
      name: "ライブラリを使ってみよう",
      content: "React Routerやフォームライブラリなど主要ライブラリを活用します",
    },
    // Web基礎 (11レッスン)
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.webBasics,
      name: "よく使うHTTPヘッダを理解する",
      content: "Content-TypeやAuthorizationなど重要なHTTPヘッダを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.webBasics,
      name: "curlとpostmanに慣れる",
      content: "APIテストに欠かせないcurlとPostmanの使い方を習得します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.webBasics,
      name: "リクエストをパースするWEBサーバを作ってみる",
      content: "HTTPリクエストを解析するシンプルなサーバを実装します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.webBasics,
      name: "Cookieを理解する",
      content: "Cookieの仕組みとセキュリティ属性の設定方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.webBasics,
      name: "サードパーティCookieについて理解する",
      content: "サードパーティCookieの仕組みとプライバシー問題を理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.webBasics,
      name: "CORSについて理解する",
      content: "オリジン間リソース共有の仕組みと適切な設定方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.webBasics,
      name: "キャッシュについて理解する",
      content: "ブラウザキャッシュとCDNキャッシュの戦略を理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.webBasics,
      name: "WEBサービスの代表的な脆弱性を理解する",
      content: "XSS、CSRF、SQLインジェクションなど主要な脆弱性を学びます",
    },
    // 開発プラクティス (7レッスン)
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.devPractice,
      name: "リンターを使おう",
      content: "ESLintやBiomeを使ったコード品質管理の方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.devPractice,
      name: "CI環境を整備してみよう",
      content: "GitHub Actionsを使った継続的インテグレーションを構築します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.devPractice,
      name: "チーム開発を円滑にするコツを覚えよう",
      content:
        "コードレビューやドキュメント作成などチーム開発のベストプラクティスを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.devPractice,
      name: "ブランチ戦略を学ぼう",
      content: "Git FlowやGitHub Flowなどブランチ戦略の違いを理解します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.devPractice,
      name: "アジャイル開発を学ぼう",
      content: "スクラムやカンバンなどアジャイル開発手法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.devPractice,
      name: "Gitの便利コマンドを覚える",
      content: "rebase、cherry-pick、stashなど便利なGitコマンドを習得します",
    },
    // インフラ (11レッスン)
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "安全なIAMの設計を理解する",
      content: "AWS IAMの最小権限原則に基づいた設計方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "マルチAZに跨るVPCを構築する",
      content: "可用性を考慮したVPCとサブネットの設計を実践します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "冗長化されたWebアプリケーションを作ってみよう",
      content: "ELBとAuto Scalingを使った冗長構成を構築します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "S3を理解する",
      content: "S3のストレージクラスやライフサイクルポリシーを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "CDN(CloudFront)について理解して使ってみよう",
      content: "CloudFrontを使ったコンテンツ配信の高速化を実践します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "ログの取り方を学ぼう",
      content: "CloudWatch Logsを使ったログ収集と分析方法を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "本番稼働中のデータベースをマイグレーションしよう",
      content: "ダウンタイムを最小化するDBマイグレーション戦略を学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "サービスのモニタリングを考える",
      content: "メトリクス収集とアラート設計のベストプラクティスを学びます",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.infrastructure,
      name: "Dockerで環境差分を吸収する",
      content: "Dockerを使った開発環境と本番環境の差異解消を学びます",
    },
    // 実践課題 (4レッスン)
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.practice,
      name: "外部APIを活用してみよう",
      content: "外部APIとの連携方法とエラーハンドリングを実践します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.practice,
      name: "MVP用フロントエンドを実装してみよう",
      content: "最小限の機能を持つフロントエンドを素早く実装します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.practice,
      name: "ログイン機能を実装してみよう",
      content: "認証・認可の基礎とセッション管理を実装します",
    },
    {
      id: ulid(),
      lessonCategoryId: actualCategoryIds.practice,
      name: "BaaSを利用してバックエンドを実装・デプロイしてみよう",
      content: "FirebaseやSupabaseを使ったバックエンド構築を体験します",
    },
  ];

  for (const lesson of lessonsData) {
    await db.insert(lessons).values(lesson).onConflictDoNothing();
  }

  console.log(`✅ lessons: ${lessonsData.length} records`);

  // ========================================
  // デモ用データ（フロントエンド動作確認用）
  // ========================================
  console.log("🌱 Seeding demo data (3 teams, 9 students)...");

  const [enrolledStatus] = await db
    .select({ id: studentStatus.id })
    .from(studentStatus)
    .where(eq(studentStatus.name, "ENROLLED"));
  if (!enrolledStatus) {
    throw new Error("ENROLLED student status not found");
  }

  const taskStatusRows = await db
    .select({ id: taskStatus.id, name: taskStatus.name })
    .from(taskStatus)
    .where(
      inArray(taskStatus.name, [
        "NOT_STARTED",
        "IN_PROGRESS",
        "IN_REVIEW",
        "COMPLETED",
      ]),
    );
  const taskStatusById = Object.fromEntries(
    taskStatusRows.map((r) => [r.name, r.id]),
  ) as Record<string, string>;
  const notStartedId = taskStatusById["NOT_STARTED"];
  const inProgressId = taskStatusById["IN_PROGRESS"];
  const inReviewId = taskStatusById["IN_REVIEW"];
  const completedId = taskStatusById["COMPLETED"];

  const allLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .orderBy(asc(lessons.id));
  const lessonIds = allLessons.map((l) => l.id);
  const lessonCount = lessonIds.length;

  const demoUsers = [
    { name: "田中太郎", mailAddress: "tanaka@example.com" },
    { name: "山田花子", mailAddress: "yamada@example.com" },
    { name: "鈴木一郎", mailAddress: "suzuki@example.com" },
    { name: "佐藤美咲", mailAddress: "sato@example.com" },
    { name: "高橋健太", mailAddress: "takahashi@example.com" },
    { name: "伊藤直樹", mailAddress: "ito@example.com" },
    { name: "渡辺さくら", mailAddress: "watanabe@example.com" },
    { name: "中村大輔", mailAddress: "nakamura@example.com" },
    { name: "小林優子", mailAddress: "kobayashi@example.com" },
  ];

  const demoUserIds = demoUsers.map(() => ulid());
  for (let i = 0; i < demoUsers.length; i++) {
    await db
      .insert(users)
      .values({
        id: demoUserIds[i] ?? ulid(),
        name: demoUsers[i]?.name ?? "",
        mailAddress: demoUsers[i]?.mailAddress ?? "",
      })
      .onConflictDoNothing({ target: users.mailAddress });
  }

  const insertedUserRows = await db
    .select({ id: users.id, mailAddress: users.mailAddress })
    .from(users)
    .where(
      inArray(
        users.mailAddress,
        demoUsers.map((u) => u.mailAddress),
      ),
    );
  const mailOrder = demoUsers.map((u) => u.mailAddress);
  const userIds = insertedUserRows
    .sort(
      (a, b) =>
        mailOrder.indexOf(a.mailAddress) - mailOrder.indexOf(b.mailAddress),
    )
    .map((r) => r.id);
  if (userIds.length !== 9) {
    throw new Error(`Expected 9 users, got ${userIds.length}`);
  }

  const teamNames = ["a", "b", "c"] as const;
  const teamIdsForInsert = teamNames.map(() => ulid());
  for (let i = 0; i < teamNames.length; i++) {
    await db
      .insert(teams)
      .values({ id: teamIdsForInsert[i] ?? ulid(), name: teamNames[i] ?? "" })
      .onConflictDoNothing({ target: teams.name });
  }

  const teamRows = await db
    .select({ id: teams.id })
    .from(teams)
    .where(inArray(teams.name, ["a", "b", "c"]))
    .orderBy(asc(teams.name));
  const [teamAId, teamBId, teamCId] = teamRows.map((r) => r.id);
  if (!teamAId || !teamBId || !teamCId) {
    throw new Error("Expected 3 teams (a, b, c)");
  }

  for (let i = 0; i < userIds.length; i++) {
    const teamId = i < 3 ? teamAId : i < 6 ? teamBId : teamCId;
    await db
      .insert(students)
      .values({
        userId: userIds[i] ?? "",
        studentStatusId: enrolledStatus.id,
        teamId,
      })
      .onConflictDoUpdate({
        target: students.userId,
        set: {
          studentStatusId: enrolledStatus.id,
          teamId,
          updatedAt: new Date(),
        },
      });
  }

  console.log("✅ Demo: 9 users, 3 teams, 9 students");

  // student_tasks: 9人 × 全レッスン、初期は NOT_STARTED
  const taskValues: Array<{
    studentId: string;
    lessonId: string;
    taskStatusId: string;
  }> = [];
  for (const userId of userIds) {
    for (const lessonId of lessonIds) {
      taskValues.push({
        studentId: userId,
        lessonId,
        taskStatusId: notStartedId ?? "",
      });
    }
  }
  const BATCH_SIZE = 500;
  for (let i = 0; i < taskValues.length; i += BATCH_SIZE) {
    const batch = taskValues.slice(i, i + BATCH_SIZE);
    await db
      .insert(studentTasks)
      .values(batch)
      .onConflictDoNothing({
        target: [studentTasks.studentId, studentTasks.lessonId],
      });
  }

  // チーム a: すごく進んでいる（約半数完了、約2割レビュー待ち、約1割取組中）
  const teamAStudentIds = userIds.slice(0, 3);
  const completedCount = Math.floor(lessonCount * 0.5);
  const inReviewCount = Math.floor(lessonCount * 0.2);
  const inProgressCount = Math.min(
    10,
    lessonCount - completedCount - inReviewCount,
  );
  const completedLessonIds = lessonIds.slice(0, completedCount);
  const inReviewLessonIds = lessonIds.slice(
    completedCount,
    completedCount + inReviewCount,
  );
  const inProgressLessonIds = lessonIds.slice(
    completedCount + inReviewCount,
    completedCount + inReviewCount + inProgressCount,
  );

  if (completedLessonIds.length > 0) {
    await db
      .update(studentTasks)
      .set({ taskStatusId: completedId, updatedAt: new Date() })
      .where(
        and(
          inArray(studentTasks.studentId, teamAStudentIds),
          inArray(studentTasks.lessonId, completedLessonIds),
        ),
      );
  }
  if (inReviewLessonIds.length > 0) {
    await db
      .update(studentTasks)
      .set({ taskStatusId: inReviewId, updatedAt: new Date() })
      .where(
        and(
          inArray(studentTasks.studentId, teamAStudentIds),
          inArray(studentTasks.lessonId, inReviewLessonIds),
        ),
      );
  }
  if (inProgressLessonIds.length > 0) {
    await db
      .update(studentTasks)
      .set({ taskStatusId: inProgressId, updatedAt: new Date() })
      .where(
        and(
          inArray(studentTasks.studentId, teamAStudentIds),
          inArray(studentTasks.lessonId, inProgressLessonIds),
        ),
      );
  }

  // チーム c: 少しだけ進んでいる（先頭5件を完了）
  const teamCStudentIds = userIds.slice(6, 9);
  const teamCCompletedLessonIds = lessonIds.slice(0, 5);
  if (teamCCompletedLessonIds.length > 0) {
    await db
      .update(studentTasks)
      .set({ taskStatusId: completedId, updatedAt: new Date() })
      .where(
        and(
          inArray(studentTasks.studentId, teamCStudentIds),
          inArray(studentTasks.lessonId, teamCCompletedLessonIds),
        ),
      );
  }

  console.log(
    `✅ Demo: ${lessonCount * 9} student_tasks (team a: progressed, team b: not started, team c: a few completed)`,
  );

  console.log("🎉 Seed completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:");
  console.error(error instanceof Error ? error.message : String(error));
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
