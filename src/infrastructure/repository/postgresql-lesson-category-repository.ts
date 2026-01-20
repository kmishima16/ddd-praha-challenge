import { eq } from "drizzle-orm";
import { LessonCategory } from "../../domain/model/lesson-category/lesson-category";
import { LessonCategoryId } from "../../domain/model/lesson-category/value-object/lesson-category-id";
import type { ILessonCategoryRepository } from "../../domain/repository/lesson-category-repository";
import type { Database } from "../../libs/drizzle/get-database";
import { lessonCategories } from "../../libs/drizzle/schema";

export class PostgresqlLessonCategoryRepository implements ILessonCategoryRepository {
  public constructor(private readonly database: Database) {}

  public async save(lessonCategory: LessonCategory): Promise<LessonCategory> {
    await this.database
      .insert(lessonCategories)
      .values({
        id: lessonCategory.id.value,
        name: lessonCategory.name,
      })
      .onConflictDoUpdate({
        target: lessonCategories.id,
        set: {
          name: lessonCategory.name,
          updatedAt: new Date(),
        },
      });

    return lessonCategory;
  }

  public async findById(id: LessonCategoryId): Promise<LessonCategory | undefined> {
    const rows = await this.database
      .select({
        id: lessonCategories.id,
        name: lessonCategories.name,
      })
      .from(lessonCategories)
      .where(eq(lessonCategories.id, id.value));

    if (rows.length === 0) {
      return undefined;
    }

    const row = rows[0]!;
    return LessonCategory.reconstruct({
      id: LessonCategoryId.reconstruct(row.id),
      name: row.name,
    });
  }

  public async findAll(): Promise<LessonCategory[]> {
    const rows = await this.database
      .select({
        id: lessonCategories.id,
        name: lessonCategories.name,
      })
      .from(lessonCategories);

    return rows.map((row) =>
      LessonCategory.reconstruct({
        id: LessonCategoryId.reconstruct(row.id),
        name: row.name,
      }),
    );
  }
}
