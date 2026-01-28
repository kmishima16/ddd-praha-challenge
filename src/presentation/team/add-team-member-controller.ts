import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { AddTeamMemberUseCase } from "../../application/use-case/add-team-member";
import { PostgresqlStudentRepository } from "../../infrastructure/repository/postgresql-student-repository";
import { PostgresqlTeamRepository } from "../../infrastructure/repository/postgresql-team-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    addTeamMemberUseCase: AddTeamMemberUseCase;
  };
};

export const addTeamMemberController = new Hono<Env>();

addTeamMemberController.post(
  "/teams/:teamId/members/add",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const studentRepository = new PostgresqlStudentRepository(database);
    const teamRepository = new PostgresqlTeamRepository(database);

    const addTeamMemberUseCase = new AddTeamMemberUseCase(
      studentRepository,
      teamRepository,
    );

    context.set("addTeamMemberUseCase", addTeamMemberUseCase);

    await next();
  }),
  async (context) => {
    const { teamId } = context.req.param();
    const body = await context.req.json();

    try {
      const payload = await context.var.addTeamMemberUseCase.invoke({
        teamId,
        studentId: body.studentId,
      });
      return context.json(payload, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === "student not found" ||
          error.message === "team not found"
        ) {
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
