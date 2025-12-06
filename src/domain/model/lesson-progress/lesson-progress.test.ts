import { describe, expect, it } from "vitest";
import { LessonId } from "../lesson/value-object/lesson-id";
import { LessonProgress } from "./lesson-progress";
import { StudentId } from "../student/value-object/student-id";

const createLessonProgress = () => {
  const studentId = StudentId.reconstruct("student-1");
  const lessonId = LessonId.reconstruct("lesson-1");
  const lessonProgress = LessonProgress.create(studentId, lessonId);
  return { lessonProgress, studentId, lessonId };
};

describe("LessonProgress", () => {
  it("初期状態はNOT_STARTED", () => {
    const { lessonProgress, studentId, lessonId } = createLessonProgress();

    expect(lessonProgress.id.value).toBeTypeOf("string");
    expect(lessonProgress.studentId.equals(studentId)).toBe(true);
    expect(lessonProgress.lessonId.equals(lessonId)).toBe(true);
    expect(lessonProgress.status.value).toBe("NOT_STARTED");
  });

  it("開始するとIN_PROGRESSになる", () => {
    const { lessonProgress } = createLessonProgress();

    lessonProgress.start();

    expect(lessonProgress.status.value).toBe("IN_PROGRESS");
  });

  it("提出するとIN_REVIEWになる", () => {
    const { lessonProgress } = createLessonProgress();

    lessonProgress.start();
    lessonProgress.submit();

    expect(lessonProgress.status.value).toBe("IN_REVIEW");
  });

  it("差し戻すとIN_PROGRESSに戻る", () => {
    const { lessonProgress } = createLessonProgress();

    lessonProgress.start();
    lessonProgress.submit();
    lessonProgress.reject();

    expect(lessonProgress.status.value).toBe("IN_PROGRESS");
  });

  it("承認するとCOMPLETEDになる", () => {
    const { lessonProgress } = createLessonProgress();

    lessonProgress.start();
    lessonProgress.submit();
    lessonProgress.complete();

    expect(lessonProgress.status.value).toBe("COMPLETED");
  });
});
