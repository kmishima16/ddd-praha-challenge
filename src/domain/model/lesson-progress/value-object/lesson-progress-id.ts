import { ulid } from "../../../../libs/ulid";
import { ValueObject } from "../../__shared__/value-object";

type LessonProgressIdProps = {
  value: string;
};

export class LessonProgressId extends ValueObject<LessonProgressIdProps> {
  private constructor(props: LessonProgressIdProps) {
    super(props);
  }

  public static create(): LessonProgressId {
    return new LessonProgressId({ value: ulid() });
  }

  public static reconstruct(value: string): LessonProgressId {
    return new LessonProgressId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
