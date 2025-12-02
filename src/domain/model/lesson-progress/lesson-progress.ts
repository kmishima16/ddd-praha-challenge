import { Entity } from "../__shared__/entity";
import type { LessonId } from "../lesson/value-object/lesson-id";
import type { StudentId } from "../student/value-object/student-id";
import { LessonProgressId } from "./value-object/lesson-progress-id";
import { ProgressStatus } from "./value-object/progress-status";

interface LessonProgressProps {
  id: LessonProgressId;
  studentId: StudentId;
  lessonId: LessonId;
  status: ProgressStatus;
}

export class LessonProgress extends Entity<LessonProgressId> {
  private studentId: StudentId;
  private lessonId: LessonId;
  private status: ProgressStatus;

  private constructor(props: LessonProgressProps) {
    super(props.id);
    this.studentId = props.studentId;
    this.lessonId = props.lessonId;
    this.status = props.status;
  }

  public static create(
    studentId: StudentId,
    lessonId: LessonId,
  ): LessonProgress {
    return new LessonProgress({
      id: LessonProgressId.create(),
      studentId: studentId,
      lessonId: lessonId,
      status: new ProgressStatus("NOT_STARTED"),
    });
  }

  get getId(): LessonProgressId {
    return this.id;
  }

  get getStudentId(): StudentId {
    return this.studentId;
  }

  get getLessonId(): LessonId {
    return this.lessonId;
  }

  get getStatus(): ProgressStatus {
    return this.status;
  }

  public start(): void {
    if (!this.status.canStart()) {
      throw new Error(
        `Cannot start challenge. Current status is ${this.status.value}`,
      );
    }
    this.status = new ProgressStatus("IN_PROGRESS");
  }

  public submit(): void {
    if (!this.status.canSubmit()) {
      throw new Error(
        `Cannot submit challenge. Current status is ${this.status.value}`,
      );
    }
    this.status = new ProgressStatus("IN_REVIEW");
  }

  public reject(): void {
    if (!this.status.canReject()) {
      throw new Error(
        `Cannot reject challenge. Current status is ${this.status.value}`,
      );
    }
    this.status = new ProgressStatus("IN_PROGRESS");
  }

  public complete(): void {
    if (!this.status.canComplete()) {
      throw new Error(
        `Cannot complete challenge. Current status is ${this.status.value}`,
      );
    }
    this.status = new ProgressStatus("COMPLETED");
  }
}
