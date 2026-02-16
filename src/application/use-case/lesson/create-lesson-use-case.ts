import { LessonCategoryId } from "../../../domain/model/lesson-category/value-object/lesson-category-id";
import { Lesson } from "../../../domain/model/lesson/lesson";
import type { ILessonRepository } from "../../../domain/repository/lesson-repository";

export type CreateLessonUseCaseInput = {
  lessonCategoryId: string;
  name: string;
  content: string;
};

export type CreateLessonUseCasePayload = {
  id: string;
  lessonCategoryId: string;
  name: string;
  content: string;
};

export class CreateLessonUseCase {
  public constructor(private readonly lessonRepository: ILessonRepository) {}

  public async invoke(
    input: CreateLessonUseCaseInput,
  ): Promise<CreateLessonUseCasePayload> {
    const lessonCategoryId = LessonCategoryId.reconstruct(
      input.lessonCategoryId,
    );
    const lesson = Lesson.create(lessonCategoryId, input.name, input.content);

    const savedLesson = await this.lessonRepository.save(lesson);

    return {
      id: savedLesson.id.value,
      lessonCategoryId: savedLesson.lessonCategoryId.value,
      name: savedLesson.name,
      content: savedLesson.content,
    };
  }
}
