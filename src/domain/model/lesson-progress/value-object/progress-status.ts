import { ValueObject } from "../../__shared__/value-object";

export type ProgressStatusType =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED";

type ProgressStatusProps = {
  value: ProgressStatusType;
};

export class ProgressStatus extends ValueObject<ProgressStatusProps> {
  constructor(value: ProgressStatusType) {
    const validStatuses: ProgressStatusType[] = [
      "NOT_STARTED",
      "IN_PROGRESS",
      "IN_REVIEW",
      "COMPLETED",
    ];
    if (!validStatuses.includes(value)) {
      throw new Error(`Invalid progress status: ${value}`);
    }
    super({ value });
  }

  get value(): ProgressStatusType {
    return this.props.value;
  }

  public canStart(): boolean {
    return this.isNotStarted();
  }

  public canSubmit(): boolean {
    return this.isInProgress();
  }

  public canReject(): boolean {
    return this.isInReview();
  }

  public canComplete(): boolean {
    return this.isInReview();
  }

  private isNotStarted(): boolean {
    return this.props.value === "NOT_STARTED";
  }

  private isInProgress(): boolean {
    return this.props.value === "IN_PROGRESS";
  }

  private isInReview(): boolean {
    return this.props.value === "IN_REVIEW";
  }
}
