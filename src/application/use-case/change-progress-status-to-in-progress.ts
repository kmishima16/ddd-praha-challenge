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

    // TODO: レビュー待ち→進行中に差し戻しする処理の遷移が実装できていない
    lessonProgress.start();

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
