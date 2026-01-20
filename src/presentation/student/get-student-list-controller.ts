import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { IStudentListQueryService } from "../../application/query-service/student-list-query-service";
import { PostgresqlStudentListQueryService } from "../../infrastructure/query-service/postgresql-student-list-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    studentListQueryService: IStudentListQueryService;
  };
};

export const getStudentListController = new Hono<Env>();

getStudentListController.get(
  "/students",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const studentListQueryService = new PostgresqlStudentListQueryService(
      database,
    );
    context.set("studentListQueryService", studentListQueryService);

    await next();
  }),
  async (context) => {
    const payload = await context.var.studentListQueryService.invoke();
    return context.json(payload);
  },
);
