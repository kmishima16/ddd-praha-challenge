import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { DeleteTeamMemberUseCase } from "../../application/use-case/delete-team-member";
import { PostgresqlTeamRepository } from "../../infrastructure/repository/postgresql-team-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    deleteTeamMemberUseCase: DeleteTeamMemberUseCase;
  };
};

export const deleteTeamMemberController = new Hono<Env>();

deleteTeamMemberController.delete(
  "/teams/members/:studentId",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const teamRepository = new PostgresqlTeamRepository(database);

    const deleteTeamMemberUseCase = new DeleteTeamMemberUseCase(teamRepository);

    context.set("deleteTeamMemberUseCase", deleteTeamMemberUseCase);

    await next();
  }),
  async (context) => {
    const { studentId } = context.req.param();

    try {
      const payload = await context.var.deleteTeamMemberUseCase.invoke({
        studentId,
      });
      return context.json(payload, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "team not found for the student") {
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
