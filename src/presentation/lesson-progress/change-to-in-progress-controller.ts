import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { ChangeProgressStatusToInProgressUseCase } from "../../application/use-case/lesson-progress/change-progress-status-to-in-progress";
import { PostgresqlLessonProgressRepository } from "../../infrastructure/repository/postgresql-lesson-progress-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    changeToInProgressUseCase: ChangeProgressStatusToInProgressUseCase;
  };
};

export const changeToInProgressController = new Hono<Env>();

changeToInProgressController.put(
  "/lesson-progress/:studentId/:lessonId/in-progress",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonProgressRepository = new PostgresqlLessonProgressRepository(
      database,
    );

    const changeToInProgressUseCase =
      new ChangeProgressStatusToInProgressUseCase(lessonProgressRepository);

    context.set("changeToInProgressUseCase", changeToInProgressUseCase);

    await next();
  }),
  async (context) => {
    const { studentId, lessonId } = context.req.param();

    try {
      const payload = await context.var.changeToInProgressUseCase.invoke({
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

        if (error.message.includes("Cannot change status")) {
          return context.json(
            {
              error: "Bad Request",
              message: error.message,
            },
            400,
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
