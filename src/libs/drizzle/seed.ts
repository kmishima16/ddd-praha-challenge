import "dotenv/config";

import { ulid } from "../ulid";
import { getDatabase } from "./get-database";
import { studentStatus, taskStatus } from "./schema";

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
