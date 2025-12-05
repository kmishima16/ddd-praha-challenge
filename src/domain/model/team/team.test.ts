import { describe, expect, it } from "vitest";
import { Team } from "./team";
import { TeamName } from "./value-object/team-name";
import { StudentId } from "../student/value-object/student-id";

const createStudentIds = (count: number): StudentId[] =>
  Array.from({ length: count }, (_, index) =>
    StudentId.reconstruct(`student-${index + 1}`),
  );

describe("Team", () => {
  it("Teamの生成", () => {
    const studentIds = createStudentIds(3);
    const team = Team.create(TeamName.create("TeamA"), studentIds);

    expect(team.getId.value).toBeTypeOf("string");
    expect(team.getId.value).not.toHaveLength(0);
    expect(team.getName.value).toBe("TeamA");
    expect(team.getStudentIds).toHaveLength(3);
    expect(team.getStudentIds.map((id) => id.value)).toEqual(
      studentIds.map((id) => id.value),
    );
    expect(team.getRecommendAction().value).toBe("NOACTION");
  });

  it("Teamの名称変更", () => {
    const team = Team.create(TeamName.create("TeamA"), createStudentIds(3));
    const newName = TeamName.create("TeamB");

    team.changeName(newName);

    expect(team.getName.value).toBe("TeamB");
  });

  it("Teamのメンバーが5名になると、分割のリコメンドが登録される", () => {
    const studentIds = createStudentIds(4);
    const team = Team.create(TeamName.create("TeamA"), studentIds);
    const newMember = StudentId.reconstruct("student-extra");

    team.addMember(newMember);

    expect(team.getStudentIds).toHaveLength(5);
    expect(team.getStudentIds.map((id) => id.value)).toContain(newMember.value);
    expect(team.getRecommendAction().value).toBe("SPLIT");
  });

  it("Teamのメンバー削除", () => {
    const studentIds = createStudentIds(2);
    const team = Team.create(TeamName.create("TeamA"), studentIds);
    const targetMember = studentIds[0];
    if (!targetMember)
      throw new Error("No student found: createStudentIds failed");

    team.removeMember(targetMember);

    expect(team.getStudentIds).toHaveLength(1);
    expect(team.getRecommendAction().value).toBe("DISBAND");
  });

  it("Teamのメンバー入れ替え", () => {
    const team = Team.create(TeamName.create("TeamA"), createStudentIds(3));
    const replacementMembers = [
      StudentId.reconstruct("replacement-1"),
      StudentId.reconstruct("replacement-2"),
      StudentId.reconstruct("replacement-3"),
    ];

    team.replaceMembers(replacementMembers);

    expect(team.getStudentIds.map((id) => id.value)).toEqual(
      replacementMembers.map((id) => id.value),
    );
    expect(team.getRecommendAction().value).toBe("NOACTION");
  });

  it("Teamのメール通知判定", () => {
    const teamWithTwoMembers = Team.create(
      TeamName.create("TeamA"),
      createStudentIds(2),
    );
    const teamWithThreeMembers = Team.create(
      TeamName.create("TeamB"),
      createStudentIds(3),
    );

    expect(teamWithTwoMembers.isRequiredMailNotification()).toBe(true);
    expect(teamWithThreeMembers.isRequiredMailNotification()).toBe(false);
  });
});
