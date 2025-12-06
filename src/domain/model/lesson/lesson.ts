import { Entity } from "../__shared__/entity";
import { LessonId } from "./value-object/lesson-id";

interface LessonProps {
  id: LessonId;
  name: string;
  content: string;
}

export class Lesson extends Entity<LessonId> {
  #name: string;
  #content: string;

  private constructor(props: LessonProps) {
    super(props.id);

    this.#name = props.name;
    this.#content = props.content;
  }

  public static create(name: string, content: string): Lesson {
    return new Lesson({
      id: LessonId.create(),
      name: name,
      content: content,
    });
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
