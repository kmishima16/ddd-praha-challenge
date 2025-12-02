import type { LessonProgress } from "../model/lesson-progress/lesson-progress";

export interface ILessonProgressRepository {
  saveAll(progresses: LessonProgress[]): Promise<void>;
}
