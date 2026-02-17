import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { ITeamGetByIdQueryService } from "../../application/query-service/team-get-by-id-query-service";
import { PostgresqlTeamGetByIdQueryService } from "../../infrastructure/query-service/postgresql-team-get-by-id-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    teamGetByIdQueryService: ITeamGetByIdQueryService;
  };
};

export const getTeamByIdController = new Hono<Env>();

getTeamByIdController.get(
  "/teams/:id",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const teamGetByIdQueryService =
      new PostgresqlTeamGetByIdQueryService(database);
    context.set("teamGetByIdQueryService", teamGetByIdQueryService);

    await next();
  }),
  async (context) => {
    const id = context.req.param("id");
    const payload = await context.var.teamGetByIdQueryService.invoke(id);

    if (payload === null) {
      return context.json({ error: "Not Found" }, 404);
    }

    return context.json(payload);
  },
);
