import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { CreateTeamUseCase } from "../../application/use-case/create-team-use-case";
import { PostgresqlTeamRepository } from "../../infrastructure/repository/postgresql-team-repository";
import { PostgresqlUniqueTeamService } from "../../infrastructure/specification/postgresql-unique-team-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    createTeamUseCase: CreateTeamUseCase;
  };
};

export const createTeamController = new Hono<Env>();

createTeamController.post(
  "/teams/new",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const teamRepository = new PostgresqlTeamRepository(database);
    const uniqueTeamService = new PostgresqlUniqueTeamService(database);

    const createTeamUseCase = new CreateTeamUseCase(
      teamRepository,
      uniqueTeamService,
    );

    context.set("createTeamUseCase", createTeamUseCase);

    await next();
  }),
  async (context) => {
    const body = await context.req.json();

    try {
      const payload = await context.var.createTeamUseCase.invoke(body);
      return context.json(payload, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "team name already exists") {
          return context.json(
            {
              error: "Conflict",
              message: error.message,
            },
            409,
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
