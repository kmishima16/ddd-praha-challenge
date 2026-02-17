import type { INotificationService } from "../../domain/specification/notification-service";

export class ConsoleNotificationService implements INotificationService {
  public async notifyLowTeamMemberCount(
    teamName: string,
    memberCount: number,
  ): Promise<void> {
    console.log(
      `Team [${teamName}] has [${memberCount}] members - notification required`,
    );
  }
}
