import { eq } from "drizzle-orm";
import type { MailAddress } from "../../domain/model/student/value-object/mail-address";
import type { IUniqueStudentService } from "../../domain/specification/unique-student-service";
import type { Database } from "../../libs/drizzle/get-database";
import { users } from "../../libs/drizzle/schema";

export class PostgresqlUniqueStudentService implements IUniqueStudentService {
  public constructor(private readonly database: Database) {}

  public async isSatisfiedBy(mailAddress: MailAddress): Promise<boolean> {
    const [existingUser] = await this.database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.mailAddress, mailAddress.value))
      .limit(1);

    // メールアドレスが存在しない場合は true（ユニーク）
    return !existingUser;
  }
}
