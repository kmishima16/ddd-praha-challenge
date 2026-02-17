export interface INotificationService {
  /**
   * チームのメンバー数が少ない場合に通知を送信する
   * @param teamName チーム名
   * @param memberCount 現在のメンバー数
   */
  notifyLowTeamMemberCount(
    teamName: string,
    memberCount: number,
  ): Promise<void>;
}
