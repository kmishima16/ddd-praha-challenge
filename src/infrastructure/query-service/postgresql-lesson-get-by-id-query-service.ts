import { eq } from "drizzle-orm";
import type {
  ILessonGetByIdQueryService,
  LessonGetByIdQueryServicePayload,
} from "../../application/query-service/lesson-get-by-id-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { lessonCategories, lessons } from "../../libs/drizzle/schema";

export class PostgresqlLessonGetByIdQueryService
  implements ILessonGetByIdQueryService
{
  public constructor(private readonly database: Database) {}

  public async invoke(
    id: string,
  ): Promise<LessonGetByIdQueryServicePayload | null> {
    const [row] = await this.database
      .select({
        id: lessons.id,
        name: lessons.name,
        content: lessons.content,
        lessonCategoryId: lessons.lessonCategoryId,
        lessonCategoryName: lessonCategories.name,
      })
      .from(lessons)
      .innerJoin(
        lessonCategories,
        eq(lessons.lessonCategoryId, lessonCategories.id),
      )
      .where(eq(lessons.id, id));

    return row
      ? {
          id: row.id,
          name: row.name,
          content: row.content,
          lessonCategoryId: row.lessonCategoryId,
          lessonCategoryName: row.lessonCategoryName,
        }
      : null;
  }
}
