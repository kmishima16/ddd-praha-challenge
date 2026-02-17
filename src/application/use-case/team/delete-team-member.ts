import { StudentId } from "../../../domain/model/student/value-object/student-id";
import type { ITeamRepository } from "../../../domain/repository/team-repository";
import type { INotificationService } from "../../../domain/specification/notification-service";

export type DeleteTeamMemberUseCaseInput = {
  studentId: string;
};

export type DeleteTeamMemberUseCasePayload = {
  studentId: string;
};

export class DeleteTeamMemberUseCase {
  public constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly notificationService: INotificationService,
  ) {}
  public async invoke(
    input: DeleteTeamMemberUseCaseInput,
  ): Promise<DeleteTeamMemberUseCasePayload> {
    const studentId = StudentId.reconstruct(input.studentId);
    const joinedTeam = await this.teamRepository.findTeamByStudentId(studentId);

    if (!joinedTeam) {
      throw new Error("team not found for the student");
    }

    joinedTeam.removeMember(studentId);

    // チームのメンバー数が2人以下になった場合、通知を送信
    if (joinedTeam.isRequiredMailNotification()) {
      await this.notificationService.notifyLowTeamMemberCount(
        joinedTeam.name.value,
        joinedTeam.studentIds.length,
      );
    }

    await this.teamRepository.save(joinedTeam);

    return {
      studentId: input.studentId,
    };
  }
}
