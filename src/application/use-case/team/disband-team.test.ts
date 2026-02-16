import { describe, expect, it, vi } from "vitest";
import { StudentId } from "../../../domain/model/student/value-object/student-id";
import { Team } from "../../../domain/model/team/team";
import { TeamId } from "../../../domain/model/team/value-object/team-id";
import { TeamName } from "../../../domain/model/team/value-object/team-name";
import type { ITeamRepository } from "../../../domain/repository/team-repository";
import { DisbandTeamUseCase } from "./disband-team";

describe("DisbandTeamUseCase", () => {
  it("disband team", async () => {
    const disbandTeamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    const destinationTeamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHJ");

    // チームメンバーが1人のチーム（解散対象）
    const mockDisbandTeam = Team.reconstruct(
      disbandTeamId,
      TeamName.create("disband team"),
      [StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHK")],
    );

    // チームメンバーが3人のチーム（統合先）
    const mockDestinationTeam = Team.reconstruct(
      destinationTeamId,
      TeamName.create("destination team"),
      [
        StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHL"),
        StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHM"),
        StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHN"),
      ],
    );

    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockDisbandTeam),
      findTeamByMinMemberCount: vi.fn().mockResolvedValue(mockDestinationTeam),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      findAll: vi.fn(),
      saveMany: vi.fn(),
      remove: vi.fn(),
    };

    const useCase = new DisbandTeamUseCase(mockTeamRepository);

    const result = await useCase.invoke({
      teamId: disbandTeamId.value,
    });

    expect(result.teamId).toBe(destinationTeamId.value);
    expect(result.memberIds).toHaveLength(1);
    expect(mockTeamRepository.save).toHaveBeenCalledOnce();
    expect(mockTeamRepository.delete).toHaveBeenCalledOnce();
  });

  it("throw error if team not found", async () => {
    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      findAll: vi.fn(),
      saveMany: vi.fn(),
      remove: vi.fn(),
    };

    const useCase = new DisbandTeamUseCase(mockTeamRepository);

    await expect(
      useCase.invoke({
        teamId: "01JKXYZ1234567890ABCDEFGHI",
      }),
    ).rejects.toThrow("Team (01JKXYZ1234567890ABCDEFGHI) not found");
  });

  it("throw error if team is not eligible for disbanding", async () => {
    const teamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    // チームメンバーが3人のチーム（解散対象外）
    const mockTeam = Team.reconstruct(teamId, TeamName.create("normal team"), [
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHK"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHL"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHM"),
    ]);

    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockTeam),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      findAll: vi.fn(),
      saveMany: vi.fn(),
      remove: vi.fn(),
    };

    const useCase = new DisbandTeamUseCase(mockTeamRepository);

    await expect(
      useCase.invoke({
        teamId: teamId.value,
      }),
    ).rejects.toThrow(`Team (${teamId.value}) is not eligible for disbanding`);
  });

  it("throw error if no destination team available", async () => {
    const teamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    const mockTeam = Team.reconstruct(teamId, TeamName.create("disband team"), [
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHK"),
    ]);

    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockTeam),
      findTeamByMinMemberCount: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      findAll: vi.fn(),
      saveMany: vi.fn(),
      remove: vi.fn(),
    };

    const useCase = new DisbandTeamUseCase(mockTeamRepository);

    await expect(
      useCase.invoke({
        teamId: teamId.value,
      }),
    ).rejects.toThrow("No destination team available for disband operation");
  });
});
