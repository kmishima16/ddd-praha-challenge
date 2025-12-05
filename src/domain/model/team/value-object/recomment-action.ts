import { ValueObject } from "../../__shared__/value-object";

export type RecommendActionType = "SPLIT" | "DISBAND" | "NOACTION";

type RecommendActionProps = {
  value: RecommendActionType;
};

export class RecommendAction extends ValueObject<RecommendActionProps> {
  constructor(value: RecommendActionType) {
    const validStatuses: RecommendActionType[] = [
      "SPLIT",
      "DISBAND",
      "NOACTION",
    ];
    if (!validStatuses.includes(value)) {
      throw new Error(`Invalid recommend action: ${value}`);
    }
    super({ value });
  }

  get value(): RecommendActionType {
    return this.props.value;
  }

  public isSplit(): boolean {
    return this.value === "SPLIT";
  }

  public isDisband(): boolean {
    return this.value === "DISBAND";
  }

  public isNoAction(): boolean {
    return this.value === "NOACTION";
  }

  public static determineRecommendAction(count: number): RecommendAction {
    if (count > 4) {
      return new RecommendAction("SPLIT");
    }
    if (count < 2) {
      return new RecommendAction("DISBAND");
    }
    return new RecommendAction("NOACTION");
  }
}
