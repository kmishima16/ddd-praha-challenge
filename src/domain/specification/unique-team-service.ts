export interface IUniqueTeamService {
  isSatisfiedBy(name: string): Promise<boolean>;
}
