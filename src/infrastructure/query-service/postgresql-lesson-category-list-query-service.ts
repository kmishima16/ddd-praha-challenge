import type {
  ILessonCategoryListQueryService,
  LessonCategoryListQueryService,
} from "../../application/query-service/lesson-category-list-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { lessonCategories } from "../../libs/drizzle/schema";

export class PostgresqlLessonCategoryListQueryService
  implements ILessonCategoryListQueryService
{
  public constructor(private readonly database: Database) {}

  public async invoke(): Promise<LessonCategoryListQueryService[]> {
    const rows = await this.database.select().from(lessonCategories);
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
    }));
  }
}
