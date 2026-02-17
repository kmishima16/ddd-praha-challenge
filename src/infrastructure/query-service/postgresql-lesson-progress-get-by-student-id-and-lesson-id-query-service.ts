import { and, eq } from "drizzle-orm";
import type {
  ILessonProgressGetByStudentIdAndLessonIdQueryService,
  LessonProgressGetByStudentIdAndLessonIdQueryServicePayload,
} from "../../application/query-service/lesson-progress-get-by-student-id-and-lesson-id-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { studentTasks, taskStatus } from "../../libs/drizzle/schema";

export class PostgresqlLessonProgressGetByStudentIdAndLessonIdQueryService
  implements ILessonProgressGetByStudentIdAndLessonIdQueryService
{
  public constructor(private readonly database: Database) {}

  public async invoke(
    studentId: string,
    lessonId: string,
  ): Promise<LessonProgressGetByStudentIdAndLessonIdQueryServicePayload | null> {
    const [row] = await this.database
      .select({
        studentId: studentTasks.studentId,
        lessonId: studentTasks.lessonId,
        status: taskStatus.name,
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

    return {
      id: `${row.studentId}-${row.lessonId}`,
      studentId: row.studentId,
      lessonId: row.lessonId,
      status: row.status,
    };
  }
}
