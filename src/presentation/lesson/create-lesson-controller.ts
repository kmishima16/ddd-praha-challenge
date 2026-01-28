import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { CreateLessonUseCase } from "../../application/use-case/create-lesson-use-case";
import { PostgresqlLessonRepository } from "../../infrastructure/repository/postgresql-lesson-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    createLessonUseCase: CreateLessonUseCase;
  };
};

export const createLessonController = new Hono<Env>();

createLessonController.post(
  "/lessons/new",
  zValidator(
    "json",
    z.object({
      lessonCategoryId: z.string().min(1, "Lesson category ID is required"),
      name: z.string().min(1, "Name is required"),
      content: z.string().min(1, "Content is required"),
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
    const lessonRepository = new PostgresqlLessonRepository(database);

    const createLessonUseCase = new CreateLessonUseCase(lessonRepository);

    context.set("createLessonUseCase", createLessonUseCase);

    await next();
  }),
  async (context) => {
    const body = context.req.valid("json");

    try {
      const payload = await context.var.createLessonUseCase.invoke(body);
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
