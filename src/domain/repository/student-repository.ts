import type { Student } from "../model/student/student";
import type { StudentId } from "../model/student/value-object/student-id";

export interface IStudentRepository {
  save(student: Student): Promise<Student>;
  findById(id: StudentId): Promise<Student | null>;
}
