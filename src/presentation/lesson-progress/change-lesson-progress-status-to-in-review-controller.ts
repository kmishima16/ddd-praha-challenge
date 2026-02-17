import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { ChangeProgressStatusToInReviewUseCase } from "../../application/use-case/lesson-progress/change-progress-status-to-in-review";
import { PostgresqlLessonProgressRepository } from "../../infrastructure/repository/postgresql-lesson-progress-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    changeToInReviewUseCase: ChangeProgressStatusToInReviewUseCase;
  };
};

export const changeLessonProgressStatusToInReviewController = new Hono<Env>();

changeLessonProgressStatusToInReviewController.put(
  "/lesson-progress/:studentId/:lessonId/in-review",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonProgressRepository = new PostgresqlLessonProgressRepository(
      database,
    );

    const changeToInReviewUseCase = new ChangeProgressStatusToInReviewUseCase(
      lessonProgressRepository,
    );

    context.set("changeToInReviewUseCase", changeToInReviewUseCase);

    await next();
  }),
  async (context) => {
    const { studentId, lessonId } = context.req.param();

    try {
      const payload = await context.var.changeToInReviewUseCase.invoke({
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
