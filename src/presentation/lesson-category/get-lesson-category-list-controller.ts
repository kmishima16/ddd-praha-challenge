import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { ILessonCategoryListQueryService } from "../../application/query-service/lesson-category-list-query-service";
import { PostgresqlLessonCategoryListQueryService } from "../../infrastructure/query-service/postgresql-lesson-category-list-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    lessonCategoryListQueryService: ILessonCategoryListQueryService;
  };
};

export const getLessonCategoryListController = new Hono<Env>();

getLessonCategoryListController.get(
  "/lesson-categories",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonCategoryListQueryService =
      new PostgresqlLessonCategoryListQueryService(database);
    context.set("lessonCategoryListQueryService", lessonCategoryListQueryService);

    await next();
  }),
  async (context) => {
    const payload =
      await context.var.lessonCategoryListQueryService.invoke();
    return context.json(payload);
  },
);
