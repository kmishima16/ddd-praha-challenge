import { Entity } from "../__shared__/entity";
import type { LessonCategoryId } from "../lesson-category/value-object/lesson-category-id";
import { LessonId } from "./value-object/lesson-id";

interface LessonProps {
  id: LessonId;
  lessonCategoryId: LessonCategoryId;
  name: string;
  content: string;
}

export class Lesson extends Entity<LessonId> {
  #lessonCategoryId: LessonCategoryId;
  #name: string;
  #content: string;

  private constructor(props: LessonProps) {
    super(props.id);

    this.#lessonCategoryId = props.lessonCategoryId;
    this.#name = props.name;
    this.#content = props.content;
  }

  public static create(
    lessonCategoryId: LessonCategoryId,
    name: string,
    content: string,
  ): Lesson {
    return new Lesson({
      id: LessonId.create(),
      lessonCategoryId: lessonCategoryId,
      name: name,
      content: content,
    });
  }

  public static reconstruct(props: LessonProps): Lesson {
    return new Lesson(props);
  }

  get lessonCategoryId(): LessonCategoryId {
    return this.#lessonCategoryId;
  }

  get name(): string {
    return this.#name;
  }

  get content(): string {
    return this.#content;
  }

  public changeName(name: string): void {
    this.#name = name;
  }

  public changeContent(content: string): void {
    this.#content = content;
  }
}
