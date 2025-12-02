import type { Team } from "../model/team/team";
import type { TeamId } from "../model/team/value-object/team-id";

export interface ITeamRepository {
  findById(id: TeamId): Promise<Team | null>;
  findTeamByMinMemberCount(exceptTeamId?: TeamId): Promise<Team | null>;
  save(team: Team): Promise<void>;
  saveMany(teams: Team[]): Promise<void>;
  remove(id: TeamId): Promise<void>;
}
