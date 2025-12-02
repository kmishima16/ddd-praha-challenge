import { Entity } from "../__shared__/entity";
import type { StudentId } from "../student/value-object/student-id";
import type { RecommendAction } from "./value-object/recomment-action";
import { TeamId } from "./value-object/team-id";
import type { TeamName } from "./value-object/team-name";

interface TeamProps {
  id: TeamId;
  name: TeamName;
  studentIds: StudentId[];
  recommendAction: RecommendAction | null;
}

export class Team extends Entity<TeamId> {
  private name: TeamName;
  private studentIds: StudentId[];
  private recommendAction: RecommendAction | null;

  private constructor(props: TeamProps) {
    super(props.id);
    this.name = props.name;
    this.studentIds = props.studentIds;
    this.recommendAction = props.recommendAction;
  }

  public static create(name: TeamName, studentIds: StudentId[]): Team {
    const team = new Team({
      id: TeamId.create(),
      name: name,
      studentIds: studentIds,
      recommendAction: null,
    });
    team.updateRecommendAction();
    return team;
  }

  get getId(): TeamId {
    return this.id;
  }

  get getName(): TeamName {
    return this.name;
  }

  get getStudentIds(): StudentId[] {
    return [...this.studentIds];
  }

  public getRecommendAction(): RecommendAction | null {
    return this.recommendAction;
  }

  public changeName(name: TeamName): void {
    this.name = name;
  }

  public addMember(studentId: StudentId): void {
    if (this.recommendAction === "SPLIT") {
      throw new Error("Cannot add member to a team recommended for splitting");
    }
    if (this.studentIds.includes(studentId)) {
      throw new Error("User is already a member of the team");
    }
    this.studentIds.push(studentId);
    this.updateRecommendAction();
  }

  public removeMember(studentId: StudentId): void {
    if (this.recommendAction === "DISBAND") {
      throw new Error(
        "Cannot remove member from a team recommended for disbanding",
      );
    }
    if (!this.studentIds.includes(studentId)) {
      throw new Error("User is not a member of the team");
    }
    this.studentIds = this.studentIds.filter((id) => id !== studentId);
    this.updateRecommendAction();
  }

  public replaceMembers(studentIds: StudentId[]): void {
    if (studentIds.length === 0) {
      throw new Error("Team must have at least one member");
    }
    if (new Set(studentIds).size !== studentIds.length) {
      throw new Error("Team members must be unique");
    }
    this.studentIds = [...studentIds];
    this.updateRecommendAction();
  }

  public isRequiredMailNotification(): boolean {
    return this.studentIds.length === 2;
  }

  private updateRecommendAction(): void {
    if (this.isOverCapacity()) {
      this.recommendAction = "SPLIT";
      return;
    }

    if (this.isUnderCapacity()) {
      this.recommendAction = "DISBAND";
      return;
    }

    this.recommendAction = null;
  }

  private isOverCapacity(): boolean {
    return this.studentIds.length > 4;
  }

  private isUnderCapacity(): boolean {
    return this.studentIds.length < 2;
  }
}
