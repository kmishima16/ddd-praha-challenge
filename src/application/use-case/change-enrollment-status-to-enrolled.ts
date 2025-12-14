import { StudentId } from "../../domain/model/student/value-object/student-id";
import type { IStudentRepository } from "../../domain/repository/student-repository";

export type ChangeEnrollmentStatusToEnrolledUseCaseInput = {
  studentId: string;
};

export type ChangeEnrollmentStatusToEnrolledUseCasePayload = {
  id: string;
  studentId: string;
  status: string;
};

export class ChangeEnrollmentStatusToOnLeaveUseCase {
  public constructor(private readonly studentRepository: IStudentRepository) {}

  public async invoke(
    input: ChangeEnrollmentStatusToEnrolledUseCaseInput,
  ): Promise<ChangeEnrollmentStatusToEnrolledUseCasePayload> {
    const studentId = StudentId.reconstruct(input.studentId);
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error("student not found");
    }

    student.changeEnrollmentStatus("ENROLLED");
    const updatedStudent = await this.studentRepository.save(student);

    return {
      id: updatedStudent.id.value,
      studentId: updatedStudent.id.value,
      status: updatedStudent.enrollmentStatus,
    };
  }
}
