import { LessonCategory } from "../../../domain/model/lesson-category/lesson-category";
import type { ILessonCategoryRepository } from "../../../domain/repository/lesson-category-repository";

export type CreateLessonCategoryUseCaseInput = {
  name: string;
};

export type CreateLessonCategoryUseCasePayload = {
  id: string;
  name: string;
};

export class CreateLessonCategoryUseCase {
  public constructor(
    private readonly lessonCategoryRepository: ILessonCategoryRepository,
  ) {}

  public async invoke(
    input: CreateLessonCategoryUseCaseInput,
  ): Promise<CreateLessonCategoryUseCasePayload> {
    const lessonCategory = LessonCategory.create(input.name);
    const savedLessonCategory =
      await this.lessonCategoryRepository.save(lessonCategory);

    return {
      id: savedLessonCategory.id.value,
      name: savedLessonCategory.name,
    };
  }
}
