import { ValueObject } from "../../__shared__/value-object";

type MailAddressProps = {
  value: string;
};

export class MailAddress extends ValueObject<MailAddressProps> {
  private constructor(props: MailAddressProps) {
    MailAddress.validate(props.value);
    super(props);
  }

  public static create(value: string): MailAddress {
    return new MailAddress({ value });
  }

  get value(): string {
    return this.props.value;
  }

  private static validate(value: string): void {
    if (!value) {
      throw new Error("Email cannot be empty");
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      throw new Error("Email format is invalid");
    }
  }
}
