import { ulid } from "../../../../libs/ulid";
import { ValueObject } from "../../__shared__/value-object";

type LessonIdProps = {
  value: string;
};

export class LessonId extends ValueObject<LessonIdProps> {
  private constructor(props: LessonIdProps) {
    super(props);
  }

  public static create(): LessonId {
    return new LessonId({ value: ulid() });
  }

  public static reconstruct(value: string): LessonId {
    return new LessonId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
