import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { ChangeEnrollmentStatusToEnrolledUseCase } from "../../application/use-case/student/change-enrollment-status-to-enrolled";
import { PostgresqlStudentRepository } from "../../infrastructure/repository/postgresql-student-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    changeEnrollmentStatusToEnrolledUseCase: ChangeEnrollmentStatusToEnrolledUseCase;
  };
};

export const changeEnrollmentStatusToEnrolledController = new Hono<Env>();

changeEnrollmentStatusToEnrolledController.put(
  "/students/:studentId/enrollment-status/enrolled",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const studentRepository = new PostgresqlStudentRepository(database);

    const changeEnrollmentStatusToEnrolledUseCase =
      new ChangeEnrollmentStatusToEnrolledUseCase(studentRepository);

    context.set(
      "changeEnrollmentStatusToEnrolledUseCase",
      changeEnrollmentStatusToEnrolledUseCase,
    );

    await next();
  }),
  async (context) => {
    const studentId = context.req.param("studentId");

    try {
      const payload =
        await context.var.changeEnrollmentStatusToEnrolledUseCase.invoke({
          studentId,
        });
      return context.json(payload, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "student not found") {
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
