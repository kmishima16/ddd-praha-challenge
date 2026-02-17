export type TeamListQueryService = {
  id: string;
  name: string;
  memberIds: string[];
  recommendAction: string;
  canSplit: boolean;
  canDisband: boolean;
};

export interface ITeamListQueryService {
  invoke(): Promise<TeamListQueryService[]>;
}
