import { and, eq } from "drizzle-orm";
import { LessonProgress } from "../../domain/model/lesson-progress/lesson-progress";
import { LessonProgressId } from "../../domain/model/lesson-progress/value-object/lesson-progress-id";
import { ProgressStatus } from "../../domain/model/lesson-progress/value-object/progress-status";
import { LessonId } from "../../domain/model/lesson/value-object/lesson-id";
import { StudentId } from "../../domain/model/student/value-object/student-id";
import type { ILessonProgressRepository } from "../../domain/repository/lesson-progress-repository";
import type { Database } from "../../libs/drizzle/get-database";
import { studentTasks, taskStatus } from "../../libs/drizzle/schema";

export class PostgresqlLessonProgressRepository
  implements ILessonProgressRepository
{
  public constructor(private readonly database: Database) {}

  public async save(progress: LessonProgress): Promise<LessonProgress> {
    // task_status テーブルから progress status の ID を取得
    const [statusRow] = await this.database
      .select({ id: taskStatus.id })
      .from(taskStatus)
      .where(eq(taskStatus.name, progress.status.value));

    if (!statusRow) {
      throw new Error(`Task status not found: ${progress.status.value}`);
    }

    await this.database
      .insert(studentTasks)
      .values({
        studentId: progress.studentId.value,
        lessonId: progress.lessonId.value,
        taskStatusId: statusRow.id,
      })
      .onConflictDoUpdate({
        target: [studentTasks.studentId, studentTasks.lessonId],
        set: {
          taskStatusId: statusRow.id,
          updatedAt: new Date(),
        },
      });

    return progress;
  }

  public async saveAll(progresses: LessonProgress[]): Promise<void> {
    if (progresses.length === 0) {
      return;
    }

    // 全ての progress の status を取得（通常は全て NOT_STARTED）
    const firstProgress = progresses[0];
    if (!firstProgress) {
      return;
    }

    const statusValue = firstProgress.status.value;
    const [statusRow] = await this.database
      .select({ id: taskStatus.id })
      .from(taskStatus)
      .where(eq(taskStatus.name, statusValue));

    if (!statusRow) {
      throw new Error(`Task status not found: ${statusValue}`);
    }

    // バッチ挿入
    const values = progresses.map((progress) => ({
      studentId: progress.studentId.value,
      lessonId: progress.lessonId.value,
      taskStatusId: statusRow.id,
    }));

    await this.database.insert(studentTasks).values(values);
  }

  public async findByStudentIdAndLessonId(
    studentId: string,
    lessonId: string,
  ): Promise<LessonProgress | null> {
    const [row] = await this.database
      .select({
        studentId: studentTasks.studentId,
        lessonId: studentTasks.lessonId,
        statusName: taskStatus.name,
      })
      .from(studentTasks)
      .innerJoin(taskStatus, eq(studentTasks.taskStatusId, taskStatus.id))
      .where(
        and(
          eq(studentTasks.studentId, studentId),
          eq(studentTasks.lessonId, lessonId),
        ),
      );

    if (!row) {
      return null;
    }

    return LessonProgress.reconstruct({
      id: LessonProgressId.create(), // progress には独自の ID がないため、新規生成
      studentId: StudentId.reconstruct(row.studentId),
      lessonId: LessonId.reconstruct(row.lessonId),
      status: new ProgressStatus(row.statusName as ProgressStatus["value"]),
    });
  }
}
