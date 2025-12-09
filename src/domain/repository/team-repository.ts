import type { StudentId } from "../model/student/value-object/student-id";
import type { Team } from "../model/team/team";
import type { TeamId } from "../model/team/value-object/team-id";

export interface ITeamRepository {
  findById(id: TeamId): Promise<Team | null>;
  findTeamByMinMemberCount(exceptTeamId?: TeamId): Promise<Team | null>;
  findTeamByStudentId(studentId: StudentId): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  save(team: Team): Promise<void>;
  saveMany(teams: Team[]): Promise<void>;
  remove(id: TeamId): Promise<void>;
}
