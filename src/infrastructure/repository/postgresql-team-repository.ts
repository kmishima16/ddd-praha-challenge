import { asc, count, eq, ne } from "drizzle-orm";
import type { StudentId } from "../../domain/model/student/value-object/student-id";
import { StudentId as StudentIdVO } from "../../domain/model/student/value-object/student-id";
import { Team } from "../../domain/model/team/team";
import { TeamId } from "../../domain/model/team/value-object/team-id";
import { TeamName } from "../../domain/model/team/value-object/team-name";
import type { ITeamRepository } from "../../domain/repository/team-repository";
import type { Database } from "../../libs/drizzle/get-database";
import { students, teams } from "../../libs/drizzle/schema";

export class PostgresqlTeamRepository implements ITeamRepository {
  public constructor(private readonly database: Database) {}

  public async findById(id: TeamId): Promise<Team | null> {
    const [teamRow] = await this.database
      .select()
      .from(teams)
      .where(eq(teams.id, id.value));

    if (!teamRow) {
      return null;
    }

    const memberRows = await this.database
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.teamId, teamRow.id));

    const memberIds = memberRows.map((row) =>
      StudentIdVO.reconstruct(row.userId),
    );

    return Team.reconstruct(
      TeamId.reconstruct(teamRow.id),
      TeamName.reconstruct(teamRow.name),
      memberIds,
    );
  }

  public async findTeamByMinMemberCount(
    exceptTeamId?: TeamId,
  ): Promise<Team | null> {
    const teamWithMemberCounts = await this.database
      .select({
        id: teams.id,
        name: teams.name,
        memberCount: count(students.userId),
      })
      .from(teams)
      .leftJoin(students, eq(teams.id, students.teamId))
      .where(exceptTeamId ? ne(teams.id, exceptTeamId.value) : undefined)
      .groupBy(teams.id, teams.name)
      .orderBy(asc(count(students.userId)))
      .limit(1);

    if (!teamWithMemberCounts.length) {
      return null;
    }

    const targetTeam = teamWithMemberCounts[0];
    if (!targetTeam) {
      return null;
    }

    const memberRows = await this.database
      .select({ userId: students.userId })
      .from(students)
      .where(eq(students.teamId, targetTeam.id));

    const memberIds = memberRows.map((row) =>
      StudentIdVO.reconstruct(row.userId),
    );

    return Team.reconstruct(
      TeamId.reconstruct(targetTeam.id),
      TeamName.reconstruct(targetTeam.name),
      memberIds,
    );
  }

  public async findTeamByStudentId(studentId: StudentId): Promise<Team | null> {
    const [studentRow] = await this.database
      .select({ teamId: students.teamId })
      .from(students)
      .where(eq(students.userId, studentId.value));

    if (!studentRow?.teamId) {
      return null;
    }

    return this.findById(TeamId.reconstruct(studentRow.teamId));
  }

  public async findAll(): Promise<Team[]> {
    const teamRows = await this.database.select().from(teams);

    const allTeams: Team[] = [];

    for (const teamRow of teamRows) {
      const memberRows = await this.database
        .select({ userId: students.userId })
        .from(students)
        .where(eq(students.teamId, teamRow.id));

      const memberIds = memberRows.map((row) =>
        StudentIdVO.reconstruct(row.userId),
      );

      allTeams.push(
        Team.reconstruct(
          TeamId.reconstruct(teamRow.id),
          TeamName.reconstruct(teamRow.name),
          memberIds,
        ),
      );
    }

    return allTeams;
  }

  public async save(team: Team): Promise<void> {
    await this.database.transaction(async (tx) => {
      // 1. チームを保存
      await tx
        .insert(teams)
        .values({
          id: team.id.value,
          name: team.name.value,
        })
        .onConflictDoUpdate({
          target: teams.id,
          set: {
            name: team.name.value,
            updatedAt: new Date(),
          },
        });

      // 2. 既存のメンバーのteamIdをクリア（このチームに所属していた学生）
      await tx
        .update(students)
        .set({ teamId: null, updatedAt: new Date() })
        .where(eq(students.teamId, team.id.value));

      // 3. 新しいメンバーにteamIdを設定
      if (team.studentIds.length > 0) {
        for (const studentId of team.studentIds) {
          await tx
            .update(students)
            .set({ teamId: team.id.value, updatedAt: new Date() })
            .where(eq(students.userId, studentId.value));
        }
      }
    });
  }

  public async saveMany(teamList: Team[]): Promise<void> {
    await this.database.transaction(async (tx) => {
      for (const team of teamList) {
        // 1. チームを保存
        await tx
          .insert(teams)
          .values({
            id: team.id.value,
            name: team.name.value,
          })
          .onConflictDoUpdate({
            target: teams.id,
            set: {
              name: team.name.value,
              updatedAt: new Date(),
            },
          });

        // 2. 既存のメンバーのteamIdをクリア
        await tx
          .update(students)
          .set({ teamId: null, updatedAt: new Date() })
          .where(eq(students.teamId, team.id.value));

        // 3. 新しいメンバーにteamIdを設定
        if (team.studentIds.length > 0) {
          for (const studentId of team.studentIds) {
            await tx
              .update(students)
              .set({ teamId: team.id.value, updatedAt: new Date() })
              .where(eq(students.userId, studentId.value));
          }
        }
      }
    });
  }

  public async remove(id: TeamId): Promise<void> {
    await this.database.transaction(async (tx) => {
      // 1. チームに所属する学生のteamIdをクリア
      await tx
        .update(students)
        .set({ teamId: null, updatedAt: new Date() })
        .where(eq(students.teamId, id.value));

      // 2. チームを削除
      await tx.delete(teams).where(eq(teams.id, id.value));
    });
  }

  public async delete(id: TeamId): Promise<void> {
    await this.remove(id);
  }
}
