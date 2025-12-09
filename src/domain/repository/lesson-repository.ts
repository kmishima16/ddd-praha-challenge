import type { Lesson } from "../model/lesson/lesson";

export interface ILessonRepository {
  save(lesson: Lesson): Promise<Lesson>;
  findAll(): Promise<Lesson[]>;
}
