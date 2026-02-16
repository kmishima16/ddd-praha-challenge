import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { CreateLessonProgressUseCase } from "../../application/use-case/lesson-progress/create-lesson-progress-use-case";
import { PostgresqlLessonProgressRepository } from "../../infrastructure/repository/postgresql-lesson-progress-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    createLessonProgressUseCase: CreateLessonProgressUseCase;
  };
};

export const createLessonProgressController = new Hono<Env>();

createLessonProgressController.post(
  "/lesson-progress/new",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonProgressRepository = new PostgresqlLessonProgressRepository(
      database,
    );

    const createLessonProgressUseCase = new CreateLessonProgressUseCase(
      lessonProgressRepository,
    );

    context.set("createLessonProgressUseCase", createLessonProgressUseCase);

    await next();
  }),
  async (context) => {
    const body = await context.req.json();

    try {
      const payload =
        await context.var.createLessonProgressUseCase.invoke(body);
      return context.json(payload, 201);
    } catch (error) {
      if (error instanceof Error) {
        return context.json(
          {
            error: "Internal Server Error",
            message: error.message,
          },
          500,
        );
      }

      return context.json(
        {
          error: "Internal Server Error",
          message: "An unexpected error occurred",
        },
        500,
      );
    }
  },
);
