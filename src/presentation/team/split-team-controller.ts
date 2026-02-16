import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { SplitTeamUseCase } from "../../application/use-case/team/split-team";
import { PostgresqlTeamRepository } from "../../infrastructure/repository/postgresql-team-repository";
import { PostgresqlUniqueTeamService } from "../../infrastructure/specification/postgresql-unique-team-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    splitTeamUseCase: SplitTeamUseCase;
  };
};

export const splitTeamController = new Hono<Env>();

splitTeamController.post(
  "/teams/:teamId/split",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const teamRepository = new PostgresqlTeamRepository(database);
    const uniqueTeamService = new PostgresqlUniqueTeamService(database);

    const splitTeamUseCase = new SplitTeamUseCase(
      teamRepository,
      uniqueTeamService,
    );

    context.set("splitTeamUseCase", splitTeamUseCase);

    await next();
  }),
  async (context) => {
    const { teamId } = context.req.param();
    const body = await context.req.json();

    try {
      const payload = await context.var.splitTeamUseCase.invoke({
        teamId,
        memberIds: body.memberIds,
        newTeamName: body.newTeamName,
      });
      return context.json(payload, 201);
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

        if (error.message === "New team name already exists") {
          return context.json(
            {
              error: "Conflict",
              message: error.message,
            },
            409,
          );
        }

        if (
          error.message.includes("not eligible for splitting") ||
          error.message.includes("does not have the required number of members")
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
