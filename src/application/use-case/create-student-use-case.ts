import { Student } from "../../domain/model/student/student";
import { MailAddress } from "../../domain/model/student/value-object/mail-address";
import type { IStudentRepository } from "../../domain/repository/student-repository";
import type { IUniqueStudentService } from "../../domain/specification/unique-student-service";
import type { AssignAllLessonsToNewStudentService } from "../../domain/service/assign-all-lessons-to-new-student.service";

export type CreateStudentUseCaseInput = {
  name: string;
  mailAddress: string;
};

export type CreateStudentUseCasePayload = {
  id: string;
  name: string;
  mailAddress: string;
};

export class CreateStudentUseCase {
  public constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly uniqueStudentService: IUniqueStudentService,
    private readonly assignAllLessonsToNewStudentService: AssignAllLessonsToNewStudentService,
  ) {}

  public async invoke(
    input: CreateStudentUseCaseInput,
  ): Promise<CreateStudentUseCasePayload> {
    const mailAddress = MailAddress.create(input.mailAddress);

    const isUnique = await this.uniqueStudentService.isSatisfiedBy(mailAddress);
    if (!isUnique) {
      throw new Error("mail address already exists");
    }

    const student = Student.create(input.name, mailAddress);
    await this.studentRepository.save(student);
    await this.assignAllLessonsToNewStudentService.execute(student.id);

    return {
      id: student.id.value,
      name: student.name,
      mailAddress: student.mailAddress.value,
    };
  }
}
