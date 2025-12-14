import type { ILessonProgressRepository } from "../../domain/repository/lesson-progress-repository";

export type ChangeProgressStatusToInProgressUseCaseInput = {
  studentId: string;
  lessonId: string;
};

export type ChangeProgressStatusToInProgressUseCasePayload = {
  id: string;
  studentId: string;
  lessonId: string;
  status: string;
};

export class ChangeProgressStatusToInProgressUseCase {
  public constructor(
    private readonly lessonProgressRepository: ILessonProgressRepository,
  ) {}

  public async invoke(
    input: ChangeProgressStatusToInProgressUseCaseInput,
  ): Promise<ChangeProgressStatusToInProgressUseCasePayload> {
    const lessonProgress =
      await this.lessonProgressRepository.findByStudentIdAndLessonId(
        input.studentId,
        input.lessonId,
      );
    if (!lessonProgress) {
      throw new Error("lesson progress not found");
    }

    if (lessonProgress.status.value === "NOT_STARTED") {
      lessonProgress.start();
    } else if (lessonProgress.status.value === "IN_REVIEW") {
      lessonProgress.reject();
    } else {
      throw new Error(
        `Cannot change status to IN_PROGRESS from ${lessonProgress.status.value}`,
      );
    }

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
