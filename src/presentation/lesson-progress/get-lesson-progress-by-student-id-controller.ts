import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { ILessonProgressGetByStudentIdAndLessonIdQueryService } from "../../application/query-service/lesson-progress-get-by-student-id-and-lesson-id-query-service";
import { PostgresqlLessonProgressGetByStudentIdAndLessonIdQueryService } from "../../infrastructure/query-service/postgresql-lesson-progress-get-by-student-id-and-lesson-id-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    lessonProgressGetByStudentIdAndLessonIdQueryService: ILessonProgressGetByStudentIdAndLessonIdQueryService;
  };
};

export const getLessonProgressByStudentIdController = new Hono<Env>();

getLessonProgressByStudentIdController.get(
  "/students/:studentId/lesson-progress/:lessonId",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonProgressGetByStudentIdAndLessonIdQueryService =
      new PostgresqlLessonProgressGetByStudentIdAndLessonIdQueryService(
        database,
      );
    context.set(
      "lessonProgressGetByStudentIdAndLessonIdQueryService",
      lessonProgressGetByStudentIdAndLessonIdQueryService,
    );

    await next();
  }),
  async (context) => {
    const studentId = context.req.param("studentId");
    const lessonId = context.req.param("lessonId");
    const payload =
      await context.var.lessonProgressGetByStudentIdAndLessonIdQueryService.invoke(
        studentId,
        lessonId,
      );

    if (payload === null) {
      return context.json({ error: "Not Found" }, 404);
    }

    return context.json(payload);
  },
);
