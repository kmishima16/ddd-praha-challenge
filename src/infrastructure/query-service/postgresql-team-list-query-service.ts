import { eq } from "drizzle-orm";
import type {
  ITeamListQueryService,
  TeamListQueryService,
} from "../../application/query-service/team-list-query-service";
import { RecommendAction } from "../../domain/model/team/value-object/recommend-action";
import type { Database } from "../../libs/drizzle/get-database";
import { students, teams } from "../../libs/drizzle/schema";

export class PostgresqlTeamListQueryService implements ITeamListQueryService {
  public constructor(private readonly database: Database) {}

  public async invoke(): Promise<TeamListQueryService[]> {
    const teamRows = await this.database.select().from(teams);

    const result: TeamListQueryService[] = [];

    for (const teamRow of teamRows) {
      const memberRows = await this.database
        .select({ userId: students.userId })
        .from(students)
        .where(eq(students.teamId, teamRow.id));

      const memberIds = memberRows.map((row) => row.userId);
      const recommendAction =
        RecommendAction.determineRecommendAction(memberIds.length).value;

      result.push({
        id: teamRow.id,
        name: teamRow.name,
        memberIds,
        recommendAction,
      });
    }

    return result;
  }
}
