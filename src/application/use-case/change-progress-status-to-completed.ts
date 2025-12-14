import type { ILessonProgressRepository } from "../../domain/repository/lesson-progress-repository";

export type ChangeProgressStatusToCompletedUseCaseInput = {
  studentId: string;
  lessonId: string;
};

export type ChangeProgressStatusToCompletedUseCasePayload = {
  id: string;
  studentId: string;
  lessonId: string;
  status: string;
};

export class ChangeProgressStatusToCompletedUseCase {
  public constructor(
    private readonly lessonProgressRepository: ILessonProgressRepository,
  ) {}

  public async invoke(
    input: ChangeProgressStatusToCompletedUseCaseInput,
  ): Promise<ChangeProgressStatusToCompletedUseCasePayload> {
    const lessonProgress =
      await this.lessonProgressRepository.findByStudentIdAndLessonId(
        input.studentId,
        input.lessonId,
      );
    if (!lessonProgress) {
      throw new Error("lesson progress not found");
    }

    lessonProgress.complete();

    const updatedProgress =
      await this.lessonProgressRepository.save(lessonProgress);

    return {
      id: updatedProgress.id.value,
      studentId: updatedProgress.studentId.value,
      lessonId: updatedProgress.lessonId.value,
      status: updatedProgress.status.value,
    };
  }
}
