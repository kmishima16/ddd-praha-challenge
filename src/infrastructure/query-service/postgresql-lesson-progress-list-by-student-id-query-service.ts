import { eq } from "drizzle-orm";
import type {
  ILessonProgressListByStudentIdQueryService,
  LessonProgressListByStudentIdQueryServicePayload,
} from "../../application/query-service/lesson-progress-list-by-student-id-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { studentTasks, taskStatus } from "../../libs/drizzle/schema";

export class PostgresqlLessonProgressListByStudentIdQueryService
  implements ILessonProgressListByStudentIdQueryService
{
  public constructor(private readonly database: Database) {}

  public async invoke(
    studentId: string,
  ): Promise<LessonProgressListByStudentIdQueryServicePayload> {
    const rows = await this.database
      .select({
        studentId: studentTasks.studentId,
        lessonId: studentTasks.lessonId,
        status: taskStatus.name,
      })
      .from(studentTasks)
      .innerJoin(taskStatus, eq(studentTasks.taskStatusId, taskStatus.id))
      .where(eq(studentTasks.studentId, studentId));

    return rows.map((row) => ({
      id: `${row.studentId}-${row.lessonId}`,
      studentId: row.studentId,
      lessonId: row.lessonId,
      status: row.status,
    }));
  }
}
