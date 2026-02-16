import { describe, expect, it, vi } from "vitest";
import type { ITeamRepository } from "../../../domain/repository/team-repository";
import type { IUniqueTeamService } from "../../../domain/specification/unique-team-service";
import { CreateTeamUseCase } from "./create-team-use-case";

describe("CreateTeamUseCase", () => {
  it("create team", async () => {
    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      findAll: vi.fn(),
      saveMany: vi.fn(),
      remove: vi.fn(),
    };
    const mockUniqueTeamService: IUniqueTeamService = {
      isSatisfiedBy: vi.fn().mockResolvedValue(true),
    };

    const useCase = new CreateTeamUseCase(
      mockTeamRepository,
      mockUniqueTeamService,
    );

    const result = await useCase.invoke({
      name: "testTeam",
      memberIds: ["01JKXYZ1234567890ABCDEFGHI", "01JKXYZ1234567890ABCDEFGHJ"],
    });

    expect(result.name).toBe("testTeam");
    expect(result.memberIds).toHaveLength(2);
    expect(result.id).toBeDefined();
    expect(mockTeamRepository.save).toHaveBeenCalledOnce();
  });

  it("throw error if team name already exists", async () => {
    const mockTeamRepository: ITeamRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findTeamByMinMemberCount: vi.fn(),
      delete: vi.fn(),
      findTeamByStudentId: vi.fn(),
      findAll: vi.fn(),
      saveMany: vi.fn(),
      remove: vi.fn(),
    };
    const mockUniqueTeamService: IUniqueTeamService = {
      isSatisfiedBy: vi.fn().mockResolvedValue(false),
    };

    const useCase = new CreateTeamUseCase(
      mockTeamRepository,
      mockUniqueTeamService,
    );

    await expect(
      useCase.invoke({
        name: "duplicateTeam",
        memberIds: ["01JKXYZ1234567890ABCDEFGHI"],
      }),
    ).rejects.toThrow("team name already exists");
  });
});
