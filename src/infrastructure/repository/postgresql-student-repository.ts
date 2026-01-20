import { eq } from "drizzle-orm";
import { Student } from "../../domain/model/student/student";
import type { EnrollmentStatus } from "../../domain/model/student/value-object/enrollment-status";
import { MailAddress } from "../../domain/model/student/value-object/mail-address";
import { StudentId } from "../../domain/model/student/value-object/student-id";
import type { IStudentRepository } from "../../domain/repository/student-repository";
import type { Database } from "../../libs/drizzle/get-database";
import { studentStatus, students, users } from "../../libs/drizzle/schema";

export class PostgresqlStudentRepository implements IStudentRepository {
  public constructor(private readonly database: Database) {}

  public async save(student: Student): Promise<Student> {
    // トランザクション内で users と students テーブルに保存
    const result = await this.database.transaction(async (tx) => {
      // 1. users テーブルに保存
      await tx
        .insert(users)
        .values({
          id: student.id.value,
          mailAddress: student.mailAddress.value,
          name: student.name,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            mailAddress: student.mailAddress.value,
            name: student.name,
            updatedAt: new Date(),
          },
        });

      // 2. student_status テーブルから enrollment status の ID を取得
      const [statusRow] = await tx
        .select({ id: studentStatus.id })
        .from(studentStatus)
        .where(eq(studentStatus.name, student.enrollmentStatus));

      if (!statusRow) {
        throw new Error(
          `Student status not found: ${student.enrollmentStatus}`,
        );
      }

      // 3. students テーブルに保存
      await tx
        .insert(students)
        .values({
          userId: student.id.value,
          studentStatusId: statusRow.id,
          teamId: null,
        })
        .onConflictDoUpdate({
          target: students.userId,
          set: {
            studentStatusId: statusRow.id,
            updatedAt: new Date(),
          },
        });

      return {
        id: student.id.value,
        name: student.name,
        mailAddress: student.mailAddress.value,
        enrollmentStatus: student.enrollmentStatus,
      };
    });

    return Student.reconstruct({
      id: StudentId.reconstruct(result.id),
      name: result.name,
      mailAddress: MailAddress.create(result.mailAddress),
      enrollmentStatus: result.enrollmentStatus as EnrollmentStatus,
    });
  }

  public async findById(id: StudentId): Promise<Student | null> {
    const [row] = await this.database
      .select({
        id: users.id,
        name: users.name,
        mailAddress: users.mailAddress,
        statusName: studentStatus.name,
      })
      .from(users)
      .innerJoin(students, eq(students.userId, users.id))
      .innerJoin(studentStatus, eq(students.studentStatusId, studentStatus.id))
      .where(eq(users.id, id.value));

    if (!row) {
      return null;
    }

    return Student.reconstruct({
      id: StudentId.reconstruct(row.id),
      name: row.name,
      mailAddress: MailAddress.create(row.mailAddress),
      enrollmentStatus: row.statusName as EnrollmentStatus,
    });
  }
}
