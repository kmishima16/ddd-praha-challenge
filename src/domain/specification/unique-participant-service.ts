import type { MailAddress } from "../model/student/value-object/mail-address";

export interface IUniqueParticipantService {
  isSatisfiedBy(email: MailAddress): Promise<boolean>;
}
