import { ulid } from "../../../../libs/ulid";
import { ValueObject } from "../../__shared__/value-object";

type StudentIdProps = {
  value: string;
};

export class StudentId extends ValueObject<StudentIdProps> {
  private constructor(props: StudentIdProps) {
    super(props);
  }

  public static createNew(): StudentId {
    return new StudentId({ value: ulid() });
  }

  public static reconstruct(value: string): StudentId {
    return new StudentId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
