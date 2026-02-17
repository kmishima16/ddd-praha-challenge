import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { IStudentGetByIdQueryService } from "../../application/query-service/student-get-by-id-query-service";
import { PostgresqlStudentGetByIdQueryService } from "../../infrastructure/query-service/postgresql-student-get-by-id-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    studentGetByIdQueryService: IStudentGetByIdQueryService;
  };
};

export const getStudentByIdController = new Hono<Env>();

getStudentByIdController.get(
  "/students/:id",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const studentGetByIdQueryService = new PostgresqlStudentGetByIdQueryService(
      database,
    );
    context.set("studentGetByIdQueryService", studentGetByIdQueryService);

    await next();
  }),
  async (context) => {
    const id = context.req.param("id");
    const payload = await context.var.studentGetByIdQueryService.invoke(id);

    if (payload === null) {
      return context.json({ error: "Not Found" }, 404);
    }

    return context.json(payload);
  },
);
