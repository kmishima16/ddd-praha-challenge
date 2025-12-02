import { ulid } from "../../../../libs/ulid";
import { ValueObject } from "../../__shared__/value-object";

type TeamIdProps = {
  value: string;
};

export class TeamId extends ValueObject<TeamIdProps> {
  private constructor(props: TeamIdProps) {
    super(props);
  }

  public static create(): TeamId {
    return new TeamId({ value: ulid() });
  }

  public static reconstruct(value: string): TeamId {
    return new TeamId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
