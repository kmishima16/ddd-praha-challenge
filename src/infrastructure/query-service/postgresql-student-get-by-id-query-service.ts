import { eq } from "drizzle-orm";
import type {
  IStudentGetByIdQueryService,
  StudentGetByIdQueryServicePayload,
} from "../../application/query-service/student-get-by-id-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { studentStatus, students, users } from "../../libs/drizzle/schema";

export class PostgresqlStudentGetByIdQueryService
  implements IStudentGetByIdQueryService
{
  public constructor(private readonly database: Database) {}

  public async invoke(
    id: string,
  ): Promise<StudentGetByIdQueryServicePayload | null> {
    const [row] = await this.database
      .select({
        id: users.id,
        name: users.name,
        mailAddress: users.mailAddress,
        enrollmentStatus: studentStatus.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(studentStatus, eq(students.studentStatusId, studentStatus.id))
      .where(eq(users.id, id));

    return row ?? null;
  }
}
