export type TeamListQueryService = {
  id: string;
  name: string;
  memberIds: string[];
  recommendAction: string;
};

export interface ITeamListQueryService {
  invoke(): Promise<TeamListQueryService[]>;
}
