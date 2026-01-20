import { LessonCategoryId } from "../../domain/model/lesson-category/value-object/lesson-category-id";
import { Lesson } from "../../domain/model/lesson/lesson";
import { LessonId } from "../../domain/model/lesson/value-object/lesson-id";
import type { ILessonRepository } from "../../domain/repository/lesson-repository";
import type { Database } from "../../libs/drizzle/get-database";
import { lessons } from "../../libs/drizzle/schema";

export class PostgresqlLessonRepository implements ILessonRepository {
  public constructor(private readonly database: Database) {}

  public async save(lesson: Lesson): Promise<Lesson> {
    await this.database
      .insert(lessons)
      .values({
        id: lesson.id.value,
        lessonCategoryId: lesson.lessonCategoryId.value,
        name: lesson.name,
        content: lesson.content,
      })
      .onConflictDoUpdate({
        target: lessons.id,
        set: {
          lessonCategoryId: lesson.lessonCategoryId.value,
          name: lesson.name,
          content: lesson.content,
          updatedAt: new Date(),
        },
      });

    return lesson;
  }

  public async findAll(): Promise<Lesson[]> {
    const rows = await this.database
      .select({
        id: lessons.id,
        lessonCategoryId: lessons.lessonCategoryId,
        name: lessons.name,
        content: lessons.content,
      })
      .from(lessons);

    return rows.map((row) =>
      Lesson.reconstruct({
        id: LessonId.reconstruct(row.id),
        lessonCategoryId: LessonCategoryId.reconstruct(row.lessonCategoryId),
        name: row.name,
        content: row.content,
      }),
    );
  }
}
