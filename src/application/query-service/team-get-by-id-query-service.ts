export type TeamGetByIdQueryServicePayload = {
  id: string;
  name: string;
  memberIds: string[];
  recommendAction: string;
  canSplit: boolean;
  canDisband: boolean;
};

export interface ITeamGetByIdQueryService {
  invoke(id: string): Promise<TeamGetByIdQueryServicePayload | null>;
}
