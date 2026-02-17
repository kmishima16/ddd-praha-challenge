import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { ITeamListQueryService } from "../../application/query-service/team-list-query-service";
import { PostgresqlTeamListQueryService } from "../../infrastructure/query-service/postgresql-team-list-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    teamListQueryService: ITeamListQueryService;
  };
};

export const getTeamListController = new Hono<Env>();

getTeamListController.get(
  "/teams",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const teamListQueryService = new PostgresqlTeamListQueryService(database);
    context.set("teamListQueryService", teamListQueryService);

    await next();
  }),
  async (context) => {
    const payload = await context.var.teamListQueryService.invoke();
    return context.json(payload);
  },
);
