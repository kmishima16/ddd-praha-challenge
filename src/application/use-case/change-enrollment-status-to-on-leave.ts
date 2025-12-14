import { StudentId } from "../../domain/model/student/value-object/student-id";
import type { IStudentRepository } from "../../domain/repository/student-repository";
import type { ITeamRepository } from "../../domain/repository/team-repository";

export type ChangeEnrollmentStatusToOnLeaveUseCaseInput = {
  studentId: string;
};

export type ChangeEnrollmentStatusToOnLeaveUseCasePayload = {
  id: string;
  studentId: string;
  status: string;
};

export class ChangeEnrollmentStatusToOnLeaveUseCase {
  public constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly teamRepository: ITeamRepository,
  ) {}

  public async invoke(
    input: ChangeEnrollmentStatusToOnLeaveUseCaseInput,
  ): Promise<ChangeEnrollmentStatusToOnLeaveUseCasePayload> {
    const studentId = StudentId.reconstruct(input.studentId);
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error("student not found");
    }

    student.changeEnrollmentStatus("ON_LEAVE");
    const updatedStudent = await this.studentRepository.save(student);

    const joinedTeam = await this.teamRepository.findTeamByStudentId(studentId);
    if (joinedTeam) {
      joinedTeam.removeMember(studentId);
      await this.teamRepository.save(joinedTeam);
    }

    return {
      id: updatedStudent.id.value,
      studentId: updatedStudent.id.value,
      status: updatedStudent.enrollmentStatus,
    };
  }
}
