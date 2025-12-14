import { Student } from "../../domain/model/student/student";
import { MailAddress } from "../../domain/model/student/value-object/mail-address";
import type { IStudentRepository } from "../../domain/repository/student-repository";
import type { IUniqueStudentService } from "../../domain/specification/unique-student-service";
import type { ILessonRepository } from "../../domain/repository/lesson-repository";
import type { ILessonProgressRepository } from "../../domain/repository/lesson-progress-repository";
import { LessonProgress } from "../../domain/model/lesson-progress/lesson-progress";

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
    private readonly lessonRepository: ILessonRepository,
    private readonly lessonProgressRepository: ILessonProgressRepository,
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

    const lessons = await this.lessonRepository.findAll();
    const lessonProgresses = lessons.map((lesson) => {
      return LessonProgress.create(student.id, lesson.id);
    });
    await this.lessonProgressRepository.saveAll(lessonProgresses);

    return {
      id: student.id.value,
      name: student.name,
      mailAddress: student.mailAddress.value,
    };
  }
}
