import { eq } from "drizzle-orm";
import type { TeamName } from "../../domain/model/team/value-object/team-name";
import type { IUniqueTeamService } from "../../domain/specification/unique-team-service";
import type { Database } from "../../libs/drizzle/get-database";
import { teams } from "../../libs/drizzle/schema";

export class PostgresqlUniqueTeamService implements IUniqueTeamService {
  public constructor(private readonly database: Database) {}

  public async isSatisfiedBy(name: TeamName): Promise<boolean> {
    const [existingTeam] = await this.database
      .select()
      .from(teams)
      .where(eq(teams.name, name.value));

    return !existingTeam;
  }
}
