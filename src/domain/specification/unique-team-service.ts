import type { TeamName } from "../model/team/value-object/team-name";

export interface IUniqueTeamService {
  isSatisfiedBy(name: TeamName): Promise<boolean>;
}
