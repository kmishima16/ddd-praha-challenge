import { describe, expect, it, vi } from "vitest";
import { StudentId } from "../../domain/model/student/value-object/student-id";
import { Team } from "../../domain/model/team/team";
import { TeamId } from "../../domain/model/team/value-object/team-id";
import { TeamName } from "../../domain/model/team/value-object/team-name";
import type { ITeamRepository } from "../../domain/repository/team-repository";
import { DeleteTeamMemberUseCase } from "./delete-team-member";

describe("DeleteTeamMemberUseCase", () => {
  it("delete team member", async () => {
    const studentId = StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    const teamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHJ");

    const mockTeam = Team.reconstruct(teamId, TeamName.create("test team"), [
      studentId,
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHK"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHL"),
    ]);

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

    const useCase = new DeleteTeamMemberUseCase(mockTeamRepository);

    const result = await useCase.invoke({
      studentId: studentId.value,
    });

    expect(result.studentId).toBe(studentId.value);
    expect(mockTeamRepository.save).toHaveBeenCalledOnce();
  });

  it("throw error if team not found for the student", async () => {
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

    const useCase = new DeleteTeamMemberUseCase(mockTeamRepository);

    await expect(
      useCase.invoke({
        studentId: "01JKXYZ1234567890ABCDEFGHI",
      }),
    ).rejects.toThrow("team not found for the student");
  });
});
