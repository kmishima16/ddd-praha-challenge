import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { DisbandTeamUseCase } from "../../application/use-case/disband-team";
import { PostgresqlTeamRepository } from "../../infrastructure/repository/postgresql-team-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    disbandTeamUseCase: DisbandTeamUseCase;
  };
};

export const disbandTeamController = new Hono<Env>();

disbandTeamController.delete(
  "/teams/:teamId/disband",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const teamRepository = new PostgresqlTeamRepository(database);

    const disbandTeamUseCase = new DisbandTeamUseCase(teamRepository);

    context.set("disbandTeamUseCase", disbandTeamUseCase);

    await next();
  }),
  async (context) => {
    const { teamId } = context.req.param();

    try {
      const payload = await context.var.disbandTeamUseCase.invoke({
        teamId,
      });
      return context.json(payload, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          return context.json(
            {
              error: "Not Found",
              message: error.message,
            },
            404,
          );
        }

        if (
          error.message.includes("not eligible for disbanding") ||
          error.message ===
            "No destination team available for disband operation"
        ) {
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
