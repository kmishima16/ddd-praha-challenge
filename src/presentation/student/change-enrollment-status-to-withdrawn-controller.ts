import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { ChangeEnrollmentStatusToWithdrawnUseCase } from "../../application/use-case/student/change-enrollment-status-to-withdrawn";
import { PostgresqlStudentRepository } from "../../infrastructure/repository/postgresql-student-repository";
import { PostgresqlTeamRepository } from "../../infrastructure/repository/postgresql-team-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    changeEnrollmentStatusToWithdrawnUseCase: ChangeEnrollmentStatusToWithdrawnUseCase;
  };
};

export const changeEnrollmentStatusToWithdrawnController = new Hono<Env>();

changeEnrollmentStatusToWithdrawnController.put(
  "/students/:studentId/enrollment-status/withdrawn",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const studentRepository = new PostgresqlStudentRepository(database);
    const teamRepository = new PostgresqlTeamRepository(database);

    const changeEnrollmentStatusToWithdrawnUseCase =
      new ChangeEnrollmentStatusToWithdrawnUseCase(
        studentRepository,
        teamRepository,
      );

    context.set(
      "changeEnrollmentStatusToWithdrawnUseCase",
      changeEnrollmentStatusToWithdrawnUseCase,
    );

    await next();
  }),
  async (context) => {
    const studentId = context.req.param("studentId");

    try {
      const payload =
        await context.var.changeEnrollmentStatusToWithdrawnUseCase.invoke({
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

        if (error.message.includes("joined team for student") && error.message.includes("not found")) {
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
