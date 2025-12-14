import { StudentId } from "../../domain/model/student/value-object/student-id";
import type { ITeamRepository } from "../../domain/repository/team-repository";

export type DeleteTeamMemberUseCaseInput = {
  studentId: string;
};

export type DeleteTeamMemberUseCasePayload = {
  studentId: string;
};

export class DeleteTeamMemberUseCase {
  public constructor(private readonly teamRepository: ITeamRepository) {}
  public async invoke(
    input: DeleteTeamMemberUseCaseInput,
  ): Promise<DeleteTeamMemberUseCasePayload> {
    const studentId = StudentId.reconstruct(input.studentId);
    const joinedTeam = await this.teamRepository.findTeamByStudentId(studentId);

    if (!joinedTeam) {
      throw new Error("team not found for the student");
    }

    joinedTeam.removeMember(studentId);

    await this.teamRepository.save(joinedTeam);

    return {
      studentId: input.studentId,
    };
  }
}
