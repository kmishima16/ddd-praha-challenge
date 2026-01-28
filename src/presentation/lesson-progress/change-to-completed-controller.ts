import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { ChangeProgressStatusToCompletedUseCase } from "../../application/use-case/change-progress-status-to-completed";
import { PostgresqlLessonProgressRepository } from "../../infrastructure/repository/postgresql-lesson-progress-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    changeToCompletedUseCase: ChangeProgressStatusToCompletedUseCase;
  };
};

export const changeToCompletedController = new Hono<Env>();

changeToCompletedController.put(
  "/lesson-progress/:studentId/:lessonId/completed",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonProgressRepository = new PostgresqlLessonProgressRepository(
      database,
    );

    const changeToCompletedUseCase = new ChangeProgressStatusToCompletedUseCase(
      lessonProgressRepository,
    );
    context.set("changeToCompletedUseCase", changeToCompletedUseCase);

    await next();
  }),
  async (context) => {
    const { studentId, lessonId } = context.req.param();

    try {
      const payload = await context.var.changeToCompletedUseCase.invoke({
        studentId,
        lessonId,
      });
      return context.json(payload, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "lesson progress not found") {
          return context.json(
            {
              error: "Not Found",
              message: error.message,
            },
            404,
          );
        }

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
