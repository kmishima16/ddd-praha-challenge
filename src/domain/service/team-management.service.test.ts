import { describe, expect, it, vi } from "vitest";
import { Team } from "../model/team/team";
import { StudentId } from "../model/student/value-object/student-id";
import { TeamName } from "../model/team/value-object/team-name";
import type { ITeamRepository } from "../repository/team-repository";
import { TeamManagementService } from "./team-management.service";

const createRepositoryMock = (): ITeamRepository => ({
  findById: vi.fn(),
  findTeamByMinMemberCount: vi.fn(),
  save: vi.fn(),
  saveMany: vi.fn(),
  remove: vi.fn(),
});

const buildTeam = (name: string, memberLabels: string[]): Team => {
  return Team.create(
    TeamName.reconstruct(name),
    memberLabels.map((label) => StudentId.reconstruct(label)),
  );
};

const toValues = (studentIds: StudentId[]): string[] =>
  studentIds.map((studentId) => studentId.value);

describe("TeamManagementService", () => {
  describe("splitTeam", () => {
    it("5人のチームを3人と2人のチームへ分割して両方を保存する", async () => {
      const teamRepository = createRepositoryMock();
      const service = new TeamManagementService(teamRepository);
      const memberLabels = [
        "student-1",
        "student-2",
        "student-3",
        "student-4",
        "student-5",
      ];
      const splitTeam = buildTeam("TEAM1", memberLabels);
      vi.mocked(teamRepository.findById).mockResolvedValue(splitTeam);
      vi.mocked(teamRepository.saveMany).mockResolvedValue();

      const newTeamName = TeamName.create("TEAM2");
      const [updatedTeam, newTeam] = await service.splitTeam({
        splitTeamId: splitTeam.getId,
        newTeamName,
      });

      expect(teamRepository.findById).toHaveBeenCalledWith(splitTeam.getId);
      expect(teamRepository.saveMany).toHaveBeenCalledTimes(1);
      expect(teamRepository.saveMany).toHaveBeenCalledWith([
        splitTeam,
        newTeam,
      ]);
      expect(toValues(updatedTeam.getStudentIds)).toEqual([
        "student-4",
        "student-5",
      ]);
      expect(toValues(newTeam.getStudentIds)).toEqual([
        "student-1",
        "student-2",
        "student-3",
      ]);
    });
  });

  describe("disbandTeam", () => {
    it("解散対象チームのメンバーを別チームへ統合して保存する", async () => {
      const teamRepository = createRepositoryMock();
      const service = new TeamManagementService(teamRepository);
      const disbandTeam = buildTeam("TEAM3", ["student-10"]);
      const destinationTeam = buildTeam("TEAM4", ["student-20", "student-21"]);
      vi.mocked(teamRepository.findById).mockResolvedValue(disbandTeam);
      vi.mocked(teamRepository.findTeamByMinMemberCount).mockResolvedValue(
        destinationTeam,
      );
      vi.mocked(teamRepository.save).mockResolvedValue();
      vi.mocked(teamRepository.remove).mockResolvedValue();

      await service.disbandTeam({ disbandTeamId: disbandTeam.getId });

      expect(teamRepository.findById).toHaveBeenCalledWith(disbandTeam.getId);
      expect(teamRepository.findTeamByMinMemberCount).toHaveBeenCalledWith(
        disbandTeam.getId,
      );
      expect(teamRepository.save).toHaveBeenCalledWith(destinationTeam);
      expect(teamRepository.remove).toHaveBeenCalledWith(disbandTeam.getId);
      expect(toValues(destinationTeam.getStudentIds)).toEqual([
        "student-20",
        "student-21",
        "student-10",
      ]);
    });
  });
});
