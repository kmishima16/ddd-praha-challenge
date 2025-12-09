import { LessonProgress } from "../../domain/model/lesson-progress/lesson-progress";
import { LessonId } from "../../domain/model/lesson/value-object/lesson-id";
import { StudentId } from "../../domain/model/student/value-object/student-id";
import type { ILessonProgressRepository } from "../../domain/repository/lesson-progress-repository";

export type CreateLessonProgressUseCaseInput = {
  studentId: string;
  lessonId: string;
};

export type CreateLessonProgressUseCasePayload = {
  id: string;
  studentId: string;
  lessonId: string;
  status: string;
};

export class CreateLessonProgressUseCase {
  public constructor(
    private readonly lessonProgressRepository: ILessonProgressRepository,
  ) {}

  public async invoke(
    input: CreateLessonProgressUseCaseInput,
  ): Promise<CreateLessonProgressUseCasePayload> {
    const studentId = StudentId.reconstruct(input.studentId);
    const lessonId = LessonId.reconstruct(input.lessonId);

    const lessonProgress = LessonProgress.create(studentId, lessonId);

    const savedLessonProgress =
      await this.lessonProgressRepository.save(lessonProgress);

    return {
      id: savedLessonProgress.id.value,
      studentId: savedLessonProgress.studentId.value,
      lessonId: savedLessonProgress.lessonId.value,
      status: savedLessonProgress.status.value,
    };
  }
}
