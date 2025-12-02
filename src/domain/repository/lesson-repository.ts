import type { Lesson } from "../model/lesson/lesson";

export interface ILessonRepository {
  findAll(): Promise<Lesson[]>;
}
