import { TeamId } from "../../domain/model/team/value-object/team-id";
import type { ITeamRepository } from "../../domain/repository/team-repository";

export type DisbandTeamUseCaseInput = {
  teamId: string;
};

export type DisbandTeamUseCasePayload = {
  teamId: string;
  memberIds: string[];
};
export class DisbandTeamUseCase {
  public constructor(private readonly teamRepository: ITeamRepository) {}

  public async invoke(
    input: DisbandTeamUseCaseInput,
  ): Promise<DisbandTeamUseCasePayload> {
    const disbandTeamId = TeamId.reconstruct(input.teamId);
    const disbandTeam = await this.teamRepository.findById(disbandTeamId);
    if (!disbandTeam) {
      throw new Error(`Team (${input.teamId}) not found`);
    }

    // TODO: 定数でチェックせず、値オブジェクト側でチェックする
    if (disbandTeam.recommendAction.value !== "DISBAND") {
      throw new Error(`Team (${input.teamId}) is not eligible for disbanding`);
    }

    const destinationTeam =
      await this.teamRepository.findTeamByMinMemberCount(disbandTeamId);
    if (!destinationTeam) {
      throw new Error("No destination team available for disband operation");
    }

    const mergedMembers = [
      ...destinationTeam.studentIds,
      ...disbandTeam.studentIds,
    ];
    destinationTeam.replaceMembers(mergedMembers);

    await this.teamRepository.save(destinationTeam);
    await this.teamRepository.delete(disbandTeamId);

    return {
      teamId: destinationTeam.id.value,
      memberIds: disbandTeam.studentIds.map((id) => id.value),
    };
  }
}
