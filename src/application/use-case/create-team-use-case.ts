import { Team } from "../../domain/model/team/team";
import { TeamName } from "../../domain/model/team/value-object/team-name";
import { StudentId } from "../../domain/model/student/value-object/student-id";
import type { ITeamRepository } from "../../domain/repository/team-repository";
import type { IUniqueTeamService } from "../../domain/specification/unique-team-service";

export type CreateTeamUseCaseInput = {
  name: string;
  memberIds: string[];
};

export type CreateTeamUseCasePayload = {
  id: string;
  name: string;
  memberIds: string[];
};

export class CreateTeamUseCase {
  public constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly uniqueTeamService: IUniqueTeamService,
  ) {}

  public async invoke(
    input: CreateTeamUseCaseInput,
  ): Promise<CreateTeamUseCasePayload> {
    const teamName = TeamName.create(input.name);

    const isUnique = await this.uniqueTeamService.isSatisfiedBy(teamName);
    if (!isUnique) {
      throw new Error("team name already exists");
    }

    const memberIds = input.memberIds.map((id) => StudentId.reconstruct(id));
    const team = Team.create(teamName, memberIds);
    await this.teamRepository.save(team);

    return {
      id: team.id.value,
      name: team.name.value,
      memberIds: team.studentIds.map((studentId) => studentId.value),
    };
  }
}
