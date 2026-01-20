import { eq } from "drizzle-orm";
import type {
  IStudentListQueryService,
  StudentListQueryServicePayload,
} from "../../application/query-service/student-list-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { students } from "../../libs/drizzle/schema";
import { users } from "../../libs/drizzle/schema";
import { studentStatus } from "../../libs/drizzle/schema";

export class PostgresqlStudentListQueryService
  implements IStudentListQueryService
{
  public constructor(private readonly database: Database) {}

  public async invoke(): Promise<StudentListQueryServicePayload> {
    const rows = await this.database
      .select({
        id: users.id,
        name: users.name,
        mailAddress: users.mailAddress,
        enrollmentStatus: studentStatus.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(studentStatus, eq(students.studentStatusId, studentStatus.id));

    return rows;
  }
}
