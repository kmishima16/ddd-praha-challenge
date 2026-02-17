import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { ILessonGetByIdQueryService } from "../../application/query-service/lesson-get-by-id-query-service";
import { PostgresqlLessonGetByIdQueryService } from "../../infrastructure/query-service/postgresql-lesson-get-by-id-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    lessonGetByIdQueryService: ILessonGetByIdQueryService;
  };
};

export const getLessonByIdController = new Hono<Env>();

getLessonByIdController.get(
  "/lessons/:id",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonGetByIdQueryService = new PostgresqlLessonGetByIdQueryService(
      database,
    );
    context.set("lessonGetByIdQueryService", lessonGetByIdQueryService);

    await next();
  }),
  async (context) => {
    const id = context.req.param("id");
    const payload =
      await context.var.lessonGetByIdQueryService.invoke(id);

    if (payload === null) {
      return context.json({ error: "Not Found" }, 404);
    }

    return context.json(payload);
  },
);
