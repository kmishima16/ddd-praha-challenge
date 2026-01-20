import { ulid } from "../../../../libs/ulid";
import { ValueObject } from "../../__shared__/value-object";

type LessonCategoryIdProps = {
  value: string;
};

export class LessonCategoryId extends ValueObject<LessonCategoryIdProps> {
  private constructor(props: LessonCategoryIdProps) {
    super(props);
  }

  public static create(): LessonCategoryId {
    return new LessonCategoryId({ value: ulid() });
  }

  public static reconstruct(value: string): LessonCategoryId {
    return new LessonCategoryId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
