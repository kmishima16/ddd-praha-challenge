import { describe, expect, it, vi } from "vitest";
import { Student } from "../../../domain/model/student/student";
import { MailAddress } from "../../../domain/model/student/value-object/mail-address";
import { StudentId } from "../../../domain/model/student/value-object/student-id";
import { Team } from "../../../domain/model/team/team";
import { TeamId } from "../../../domain/model/team/value-object/team-id";
import { TeamName } from "../../../domain/model/team/value-object/team-name";
import type { IStudentRepository } from "../../../domain/repository/student-repository";
import type { ITeamRepository } from "../../../domain/repository/team-repository";
import { ChangeEnrollmentStatusToOnLeaveUseCase } from "./change-enrollment-status-to-withdrawn";

describe("ChangeEnrollmentStatusToWithdrawnUseCase", () => {
  it("change enrollment status to withdrawn", async () => {
    const studentId = StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    const teamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHJ");

    const mockStudent = Student.reconstruct({
      id: studentId,
      name: "test student",
      mailAddress: MailAddress.create("test@example.com"),
      enrollmentStatus: "ENROLLED",
    });

    const mockTeam = Team.reconstruct(teamId, TeamName.create("test team"), [
      studentId,
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHK"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHL"),
    ]);

    const mockStudentRepository: IStudentRepository = {
      save: vi.fn().mockImplementation((student) => Promise.resolve(student)),
      findById: vi.fn().mockResolvedValue(mockStudent),
    };

    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn().mockResolvedValue(mockTeam),
      saveMany: vi.fn(),
      findAll: vi.fn(),
      remove: vi.fn(),
    };

    const useCase = new ChangeEnrollmentStatusToOnLeaveUseCase(
      mockStudentRepository,
      mockTeamRepository,
    );

    const result = await useCase.invoke({
      studentId: studentId.value,
    });

    expect(result.studentId).toBe(studentId.value);
    expect(result.status).toBe("WITHDRAWN");
    expect(mockStudentRepository.save).toHaveBeenCalledOnce();
    expect(mockTeamRepository.save).toHaveBeenCalledOnce();
  });

  it("throw error if student not found", async () => {
    const mockStudentRepository: IStudentRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };

    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      saveMany: vi.fn(),
      findAll: vi.fn(),
      remove: vi.fn(),
    };

    const useCase = new ChangeEnrollmentStatusToOnLeaveUseCase(
      mockStudentRepository,
      mockTeamRepository,
    );

    await expect(
      useCase.invoke({
        studentId: "01JKXYZ1234567890ABCDEFGHI",
      }),
    ).rejects.toThrow("student not found");
  });

  it("throw error if joined team not found", async () => {
    const studentId = StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    const mockStudent = Student.reconstruct({
      id: studentId,
      name: "test student",
      mailAddress: MailAddress.create("test@example.com"),
      enrollmentStatus: "ENROLLED",
    });

    const mockStudentRepository: IStudentRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockStudent),
    };

    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn().mockResolvedValue(null),
      saveMany: vi.fn(),
      findAll: vi.fn(),
      remove: vi.fn(),
    };

    const useCase = new ChangeEnrollmentStatusToOnLeaveUseCase(
      mockStudentRepository,
      mockTeamRepository,
    );

    await expect(
      useCase.invoke({
        studentId: studentId.value,
      }),
    ).rejects.toThrow(`joined team for student ${studentId.value} not found`);
  });
});
