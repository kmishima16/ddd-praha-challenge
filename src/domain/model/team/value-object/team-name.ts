import { ValueObject } from "../../__shared__/value-object";

type TeamNameProps = {
  value: string;
};

export class TeamName extends ValueObject<TeamNameProps> {
  private constructor(props: TeamNameProps) {
    TeamName.validate(props.value);
    super(props);
  }

  public static create(value: string): TeamName {
    return new TeamName({ value });
  }

  public static reconstruct(value: string): TeamName {
    return new TeamName({ value });
  }

  get value(): string {
    return this.props.value;
  }

  private static validate(value: string): void {
    if (!value) {
      throw new Error("Team name cannot be empty");
    }

    if (!/^[0-9A-Za-z]+$/.test(value)) {
      throw new Error("Team name must be alphanumeric");
    }
  }
}
