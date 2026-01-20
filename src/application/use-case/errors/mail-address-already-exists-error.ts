export class MailAddressAlreadyExistsError extends Error {
  readonly code = "MAIL_ADDRESS_ALREADY_EXISTS";
  constructor() {
    super("mail address already exists");
  }
}
