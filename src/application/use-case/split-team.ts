import { Team } from "../../domain/model/team/team";
import { TeamId } from "../../domain/model/team/value-object/team-id";
import { TeamName } from "../../domain/model/team/value-object/team-name";
import type { ITeamRepository } from "../../domain/repository/team-repository";
import type { IUniqueTeamService } from "../../domain/specification/unique-team-service";

export type SplitTeamUseCaseInput = {
  teamId: string;
  memberIds: string[];
  newTeamName: string;
};

export type SplitTeamUseCasePayload = {
  teamIds: string[];
  memberIds: string[];
};

export class SplitTeamUseCase {
  public constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly uniqueTeamService: IUniqueTeamService,
  ) {}

  public async invoke(
    input: SplitTeamUseCaseInput,
  ): Promise<SplitTeamUseCasePayload> {
    const splitTeamId = TeamId.reconstruct(input.teamId);
    const splitTeam = await this.teamRepository.findById(splitTeamId);
    if (!splitTeam) {
      throw new Error(`Team (${input.teamId}) not found`);
    }

    if (splitTeam.recommendAction.value !== "SPLIT") {
      throw new Error(`Team (${input.teamId}) is not eligible for splitting`);
    }

    const members = splitTeam.studentIds;

    // 先頭3名と末尾2名でチーム分割（単純な分割ロジックを採用）
    const newTeamMembers = members.slice(0, 3);
    const remainingMembers = members.slice(-2);
    if (newTeamMembers.length !== 3 || remainingMembers.length !== 2) {
      throw new Error(
        "Team does not have the required number of members to split",
      );
    }

    const newTeamName = TeamName.create(input.newTeamName);
    const isUnique = await this.uniqueTeamService.isSatisfiedBy(newTeamName);
    if (!isUnique) {
      throw new Error("New team name already exists");
    }

    const newTeam = Team.create(newTeamName, newTeamMembers);
    splitTeam.replaceMembers(remainingMembers);

    await this.teamRepository.saveMany([splitTeam, newTeam]);

    return {
      teamIds: [splitTeam.id.value, newTeam.id.value],
      memberIds: [
        ...newTeamMembers.map((id) => id.value),
        ...remainingMembers.map((id) => id.value),
      ],
    };
  }
}
