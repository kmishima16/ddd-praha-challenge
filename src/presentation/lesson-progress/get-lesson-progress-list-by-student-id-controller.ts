import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { ILessonProgressListByStudentIdQueryService } from "../../application/query-service/lesson-progress-list-by-student-id-query-service";
import { PostgresqlLessonProgressListByStudentIdQueryService } from "../../infrastructure/query-service/postgresql-lesson-progress-list-by-student-id-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    lessonProgressListByStudentIdQueryService: ILessonProgressListByStudentIdQueryService;
  };
};

export const getLessonProgressListByStudentIdController = new Hono<Env>();

getLessonProgressListByStudentIdController.get(
  "/students/:studentId/lesson-progress",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonProgressListByStudentIdQueryService =
      new PostgresqlLessonProgressListByStudentIdQueryService(database);
    context.set(
      "lessonProgressListByStudentIdQueryService",
      lessonProgressListByStudentIdQueryService,
    );

    await next();
  }),
  async (context) => {
    const studentId = context.req.param("studentId");
    const payload =
      await context.var.lessonProgressListByStudentIdQueryService.invoke(
        studentId,
      );
    return context.json(payload);
  },
);
