import { Entity } from "../__shared__/entity";
import type { EnrollmentStatus } from "./value-object/enrollment-status";
import type { MailAddress } from "./value-object/mail-address";
import { StudentId } from "./value-object/student-id";

interface StudentProps {
  id: StudentId;
  name: string;
  mailAddress: MailAddress;
  enrollmentStatus: EnrollmentStatus;
}

export class Student extends Entity<StudentId> {
  #name: string;
  #mailAddress: MailAddress;
  #enrollmentStatus: EnrollmentStatus;

  private constructor(props: StudentProps) {
    super(props.id);
    this.#name = props.name;
    this.#mailAddress = props.mailAddress;
    this.#enrollmentStatus = props.enrollmentStatus;
  }

  public static create(name: string, mailAddress: MailAddress): Student {
    return new Student({
      id: StudentId.createNew(),
      name: name,
      mailAddress: mailAddress,
      enrollmentStatus: "ENROLLED",
    });
  }

  get name(): string {
    return this.#name;
  }

  get mailAddress(): MailAddress {
    return this.#mailAddress;
  }

  get enrollmentStatus(): EnrollmentStatus {
    return this.#enrollmentStatus;
  }

  public changeName(name: string): void {
    this.#name = name;
  }

  public changeMailAddress(mailAddress: MailAddress): void {
    this.#mailAddress = mailAddress;
  }

  public changeEnrollmentStatus(enrollmentStatus: EnrollmentStatus): void {
    this.#enrollmentStatus = enrollmentStatus;
  }
}
