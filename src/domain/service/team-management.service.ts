import { Team } from "../model/team/team";
import type { TeamId } from "../model/team/value-object/team-id";
import type { TeamName } from "../model/team/value-object/team-name";
import type { ITeamRepository } from "../repository/team-repository";

export type SplitTeamInput = {
  splitTeamId: TeamId;
  newTeamName: TeamName;
};

export type DisbandTeamInput = {
  disbandTeamId: TeamId;
};

export class TeamManagementService {
  private static readonly SPLIT_REQUIRED_MEMBERS = 5; // 5人を前提としたチーム分割のため

  public constructor(private readonly teamRepository: ITeamRepository) {}

  public async splitTeam(input: SplitTeamInput): Promise<[Team, Team]> {
    const splitTeam = await this.teamRepository.findById(input.splitTeamId);
    if (!splitTeam) {
      throw new Error(`Team (${input.splitTeamId}) not found`);
    }

    const members = splitTeam.getStudentIds;
    if (members.length !== TeamManagementService.SPLIT_REQUIRED_MEMBERS) {
      throw new Error(
        "Team does not have the required number of members to split",
      );
    }

    // 先頭3名と末尾2名でチーム分割（単純な分割ロジックを採用する）
    const newTeamMembers = members.slice(0, 3);
    const remainingMembers = members.slice(-2);
    if (newTeamMembers.length !== 3 || remainingMembers.length !== 2) {
      throw new Error(
        "Team does not have the required number of members to split",
      );
    }

    const newTeam = Team.create(input.newTeamName, newTeamMembers);
    splitTeam.replaceMembers(remainingMembers);

    await this.teamRepository.saveMany([splitTeam, newTeam]);

    return [splitTeam, newTeam];
  }

  public async disbandTeam(input: DisbandTeamInput): Promise<void> {
    const disbandTeam = await this.teamRepository.findById(input.disbandTeamId);
    if (!disbandTeam) {
      throw new Error(`Team (${input.disbandTeamId}) not found`);
    }

    const destinationTeam = await this.teamRepository.findTeamByMinMemberCount(
      input.disbandTeamId,
    );
    if (!destinationTeam) {
      throw new Error("No destination team available for disband operation");
    }

    const mergedMembers = [
      ...destinationTeam.getStudentIds,
      ...disbandTeam.getStudentIds,
    ];
    destinationTeam.replaceMembers(mergedMembers);

    await this.teamRepository.save(destinationTeam);
    await this.teamRepository.remove(disbandTeam.getId);
  }
}
