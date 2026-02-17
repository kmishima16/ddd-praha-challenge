export type TeamGetByIdQueryServicePayload = {
  id: string;
  name: string;
  memberIds: string[];
  recommendAction: string;
};

export interface ITeamGetByIdQueryService {
  invoke(id: string): Promise<TeamGetByIdQueryServicePayload | null>;
}
