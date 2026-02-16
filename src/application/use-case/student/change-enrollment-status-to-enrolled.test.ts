import { describe, expect, it, vi } from "vitest";
import { Student } from "../../../domain/model/student/student";
import { MailAddress } from "../../../domain/model/student/value-object/mail-address";
import { StudentId } from "../../../domain/model/student/value-object/student-id";
import type { IStudentRepository } from "../../../domain/repository/student-repository";
import { ChangeEnrollmentStatusToOnLeaveUseCase } from "./change-enrollment-status-to-enrolled";

describe("ChangeEnrollmentStatusToEnrolledUseCase", () => {
  it("change enrollment status to enrolled", async () => {
    const studentId = StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    const mockStudent = Student.reconstruct({
      id: studentId,
      name: "test student",
      mailAddress: MailAddress.create("test@example.com"),
      enrollmentStatus: "ON_LEAVE",
    });

    const mockStudentRepository: IStudentRepository = {
      save: vi.fn().mockImplementation((student) => Promise.resolve(student)),
      findById: vi.fn().mockResolvedValue(mockStudent),
    };

    const useCase = new ChangeEnrollmentStatusToOnLeaveUseCase(
      mockStudentRepository,
    );

    const result = await useCase.invoke({
      studentId: studentId.value,
    });

    expect(result.studentId).toBe(studentId.value);
    expect(result.status).toBe("ENROLLED");
    expect(mockStudentRepository.save).toHaveBeenCalledOnce();
  });

  it("throw error if student not found", async () => {
    const mockStudentRepository: IStudentRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };

    const useCase = new ChangeEnrollmentStatusToOnLeaveUseCase(
      mockStudentRepository,
    );

    await expect(
      useCase.invoke({
        studentId: "01JKXYZ1234567890ABCDEFGHI",
      }),
    ).rejects.toThrow("student not found");
  });
});
