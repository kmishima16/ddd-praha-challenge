import type { LessonProgress } from "../model/lesson-progress/lesson-progress";

export interface ILessonProgressRepository {
  save(progress: LessonProgress): Promise<LessonProgress>;
  saveAll(progresses: LessonProgress[]): Promise<void>;
  findByStudentIdAndLessonId(
    studentId: string,
    lessonId: string,
  ): Promise<LessonProgress | null>;
}
