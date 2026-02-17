import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { ILessonListQueryService } from "../../application/query-service/lesson-list-query-service";
import { PostgresqlLessonListQueryService } from "../../infrastructure/query-service/postgresql-lesson-list-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    lessonListQueryService: ILessonListQueryService;
  };
};

export const getLessonListController = new Hono<Env>();

getLessonListController.get(
  "/lessons",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonListQueryService = new PostgresqlLessonListQueryService(
      database,
    );
    context.set("lessonListQueryService", lessonListQueryService);

    await next();
  }),
  async (context) => {
    const payload = await context.var.lessonListQueryService.invoke();
    return context.json(payload);
  },
);
