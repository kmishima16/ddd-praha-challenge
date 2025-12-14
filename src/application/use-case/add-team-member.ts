import { StudentId } from "../../domain/model/student/value-object/student-id";
import { TeamId } from "../../domain/model/team/value-object/team-id";
import type { IStudentRepository } from "../../domain/repository/student-repository";
import type { ITeamRepository } from "../../domain/repository/team-repository";

export type AddTeamMemberUseCaseInput = {
  teamId: string;
  studentId: string;
};

export type AddTeamMemberUseCasePayload = {
  teamId: string;
  studentId: string;
};

export class AddTeamMemberUseCase {
  public constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly teamRepository: ITeamRepository,
  ) {}
  public async invoke(
    input: AddTeamMemberUseCaseInput,
  ): Promise<AddTeamMemberUseCasePayload> {
    const studentId = StudentId.reconstruct(input.studentId);
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error("student not found");
    }

    const teamId = TeamId.reconstruct(input.teamId);
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error("team not found");
    }

    team.addMember(studentId);
    await this.teamRepository.save(team);
    return {
      teamId: input.teamId,
      studentId: input.studentId,
    };
  }
}
