import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import {
  CreateStudentUseCase,
  MailAddressAlreadyExistsError,
} from "../../application/use-case/student/create-student-use-case";
import { PostgresqlLessonProgressRepository } from "../../infrastructure/repository/postgresql-lesson-progress-repository";
import { PostgresqlLessonRepository } from "../../infrastructure/repository/postgresql-lesson-repository";
import { PostgresqlStudentRepository } from "../../infrastructure/repository/postgresql-student-repository";
import { PostgresqlUniqueStudentService } from "../../infrastructure/specification/postgresql-unique-student-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    createStudentUseCase: CreateStudentUseCase;
  };
};

export const createStudentController = new Hono<Env>();

createStudentController.post(
  "/students/new",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1, "Name is required"),
      mailAddress: z.string().email("Invalid email address"),
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
    const studentRepository = new PostgresqlStudentRepository(database);
    const lessonRepository = new PostgresqlLessonRepository(database);
    const lessonProgressRepository = new PostgresqlLessonProgressRepository(
      database,
    );
    const uniqueStudentService = new PostgresqlUniqueStudentService(database);

    const createStudentUseCase = new CreateStudentUseCase(
      studentRepository,
      uniqueStudentService,
      lessonRepository,
      lessonProgressRepository,
    );

    context.set("createStudentUseCase", createStudentUseCase);

    await next();
  }),
  async (context) => {
    const body = context.req.valid("json");

    try {
      const payload = await context.var.createStudentUseCase.invoke(body);
      return context.json(payload, 201);
    } catch (error) {
      if (error instanceof MailAddressAlreadyExistsError) {
        return context.json(
          {
            error: "Conflict",
            message: error.message,
          },
          409,
        );
      }

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
