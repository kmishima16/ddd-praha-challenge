import { eq } from "drizzle-orm";
import type {
  ILessonListQueryService,
  LessonListQueryService,
} from "../../application/query-service/lesson-list-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { lessonCategories, lessons } from "../../libs/drizzle/schema";

export class PostgresqlLessonListQueryService
  implements ILessonListQueryService
{
  public constructor(private readonly database: Database) {}

  public async invoke(): Promise<LessonListQueryService[]> {
    const rows = await this.database
      .select({
        id: lessons.id,
        lessonCategoryId: lessons.lessonCategoryId,
        lessonCategoryName: lessonCategories.name,
        name: lessons.name,
        content: lessons.content,
      })
      .from(lessons)
      .innerJoin(
        lessonCategories,
        eq(lessons.lessonCategoryId, lessonCategories.id),
      );

    return rows;
  }
}
