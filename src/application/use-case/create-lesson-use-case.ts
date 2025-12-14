import { Lesson } from "../../domain/model/lesson/lesson";
import type { ILessonRepository } from "../../domain/repository/lesson-repository";

export type CreateLessonUseCaseInput = {
  name: string;
  content: string;
};

export type CreateLessonUseCasePayload = {
  id: string;
  name: string;
  content: string;
};

export class CreateLessonUseCase {
  public constructor(private readonly lessonRepository: ILessonRepository) {}

  public async invoke(
    input: CreateLessonUseCaseInput,
  ): Promise<CreateLessonUseCasePayload> {
    const lesson = Lesson.create(input.name, input.content);

    const savedLesson = await this.lessonRepository.save(lesson);

    return {
      id: savedLesson.id.value,
      name: savedLesson.name,
      content: savedLesson.content,
    };
  }
}
