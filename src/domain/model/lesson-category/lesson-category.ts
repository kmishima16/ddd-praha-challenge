import { Entity } from "../__shared__/entity";
import { LessonCategoryId } from "./value-object/lesson-category-id";

interface LessonCategoryProps {
  id: LessonCategoryId;
  name: string;
}

export class LessonCategory extends Entity<LessonCategoryId> {
  #name: string;

  private constructor(props: LessonCategoryProps) {
    super(props.id);
    this.#name = props.name;
  }

  public static create(name: string): LessonCategory {
    return new LessonCategory({
      id: LessonCategoryId.create(),
      name: name,
    });
  }

  public static reconstruct(props: LessonCategoryProps): LessonCategory {
    return new LessonCategory(props);
  }

  get name(): string {
    return this.#name;
  }

  public changeName(name: string): void {
    this.#name = name;
  }
}
