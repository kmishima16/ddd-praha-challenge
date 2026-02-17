import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { CreateLessonCategoryUseCase } from "../../application/use-case/lesson-category/create-lesson-category-use-case";
import { PostgresqlLessonCategoryRepository } from "../../infrastructure/repository/postgresql-lesson-category-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    createLessonCategoryUseCase: CreateLessonCategoryUseCase;
  };
};

export const createLessonCategoryController = new Hono<Env>();

createLessonCategoryController.post(
  "/lesson-categories/new",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1, "Name is required"),
    }),
    (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: "Validation failed",
            details: result.error.flatten(),
          },
          400,
        );
      }

      return;
    },
  ),
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const lessonCategoryRepository = new PostgresqlLessonCategoryRepository(
      database,
    );

    const createLessonCategoryUseCase = new CreateLessonCategoryUseCase(
      lessonCategoryRepository,
    );

    context.set("createLessonCategoryUseCase", createLessonCategoryUseCase);

    await next();
  }),
  async (context) => {
    const body = context.req.valid("json");

    try {
      const payload =
        await context.var.createLessonCategoryUseCase.invoke(body);
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
