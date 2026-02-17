import { eq } from "drizzle-orm";
import type {
  ITeamGetByIdQueryService,
  TeamGetByIdQueryServicePayload,
} from "../../application/query-service/team-get-by-id-query-service";
import { RecommendAction } from "../../domain/model/team/value-object/recommend-action";
import type { Database } from "../../libs/drizzle/get-database";
import { students, teams } from "../../libs/drizzle/schema";

export class PostgresqlTeamGetByIdQueryService
  implements ITeamGetByIdQueryService
{
  public constructor(private readonly database: Database) {}

  public async invoke(
    id: string,
  ): Promise<TeamGetByIdQueryServicePayload | null> {
    const [teamRow] = await this.database
      .select()
      .from(teams)
      .where(eq(teams.id, id));

    if (!teamRow) {
      return null;
    }

    const memberRows = await this.database
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.teamId, id));

    const memberIds = memberRows.map((row) => row.userId);
    const recommendAction =
      RecommendAction.determineRecommendAction(memberIds.length).value;

    return {
      id: teamRow.id,
      name: teamRow.name,
      memberIds,
      recommendAction,
    };
  }
}
