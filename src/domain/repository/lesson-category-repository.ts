import type { LessonCategory } from "../model/lesson-category/lesson-category";
import type { LessonCategoryId } from "../model/lesson-category/value-object/lesson-category-id";

export interface ILessonCategoryRepository {
  save(lessonCategory: LessonCategory): Promise<LessonCategory>;
  findById(id: LessonCategoryId): Promise<LessonCategory | undefined>;
  findAll(): Promise<LessonCategory[]>;
}
