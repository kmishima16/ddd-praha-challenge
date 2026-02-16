import { describe, expect, it, vi } from "vitest";
import { StudentId } from "../../../domain/model/student/value-object/student-id";
import { Team } from "../../../domain/model/team/team";
import { TeamId } from "../../../domain/model/team/value-object/team-id";
import { TeamName } from "../../../domain/model/team/value-object/team-name";
import type { ITeamRepository } from "../../../domain/repository/team-repository";
import type { IUniqueTeamService } from "../../../domain/specification/unique-team-service";
import { SplitTeamUseCase } from "./split-team";

describe("SplitTeamUseCase", () => {
  it("split team", async () => {
    const teamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHI");

    // 5人のチーム（分割対象）
    const mockTeam = Team.reconstruct(teamId, TeamName.create("split team"), [
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHK"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHL"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHM"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHN"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHO"),
    ]);

    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockTeam),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      saveMany: vi.fn(),
      findAll: vi.fn(),
      remove: vi.fn(),
    };

    const mockUniqueTeamService: IUniqueTeamService = {
      isSatisfiedBy: vi.fn().mockResolvedValue(true),
    };

    const useCase = new SplitTeamUseCase(
      mockTeamRepository,
      mockUniqueTeamService,
    );

    const result = await useCase.invoke({
      teamId: teamId.value,
      memberIds: [],
      newTeamName: "new team",
    });

    expect(result.teamIds).toHaveLength(2);
    expect(result.memberIds).toHaveLength(5);
    expect(mockTeamRepository.saveMany).toHaveBeenCalledOnce();
  });

  it("throw error if team not found", async () => {
    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      saveMany: vi.fn(),
      findAll: vi.fn(),
      remove: vi.fn(),
    };

    const mockUniqueTeamService: IUniqueTeamService = {
      isSatisfiedBy: vi.fn().mockResolvedValue(true),
    };

    const useCase = new SplitTeamUseCase(
      mockTeamRepository,
      mockUniqueTeamService,
    );

    await expect(
      useCase.invoke({
        teamId: "01JKXYZ1234567890ABCDEFGHI",
        memberIds: [],
        newTeamName: "new team",
      }),
    ).rejects.toThrow("Team (01JKXYZ1234567890ABCDEFGHI) not found");
  });

  it("throw error if team is not eligible for splitting", async () => {
    const teamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    // 3人のチーム（分割対象外）
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
      saveMany: vi.fn(),
      findAll: vi.fn(),
      remove: vi.fn(),
    };

    const mockUniqueTeamService: IUniqueTeamService = {
      isSatisfiedBy: vi.fn().mockResolvedValue(true),
    };

    const useCase = new SplitTeamUseCase(
      mockTeamRepository,
      mockUniqueTeamService,
    );

    await expect(
      useCase.invoke({
        teamId: teamId.value,
        memberIds: [],
        newTeamName: "new team",
      }),
    ).rejects.toThrow(`Team (${teamId.value}) is not eligible for splitting`);
  });

  it("throw error if new team name already exists", async () => {
    const teamId = TeamId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    const mockTeam = Team.reconstruct(teamId, TeamName.create("split team"), [
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHK"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHL"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHM"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHN"),
      StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHO"),
    ]);

    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockTeam),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      remove: vi.fn(),
      findTeamByStudentId: vi.fn(),
      saveMany: vi.fn(),
    };

    const mockUniqueTeamService: IUniqueTeamService = {
      isSatisfiedBy: vi.fn().mockResolvedValue(false),
    };

    const useCase = new SplitTeamUseCase(
      mockTeamRepository,
      mockUniqueTeamService,
    );

    await expect(
      useCase.invoke({
        teamId: teamId.value,
        memberIds: [],
        newTeamName: "duplicate team",
      }),
    ).rejects.toThrow("New team name already exists");
  });
});
