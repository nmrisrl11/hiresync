import { Email } from "../value-objects/email.value-object";
import { Account } from "./account.entity";
import { Role } from "./role.entity";

export class User {
	constructor(
		public readonly id: string,
		public readonly email: Email,
		public readonly name: string,
		public readonly isVerified: boolean,
		public readonly role: Role,
		public readonly account: Account | null,
		public readonly image: string | null,
	) {}

	public static createForRegistration(
		id: string,
		accountId: string,
		emailString: string,
		name: string,
		role: Role,
		passwordHash: string,
		verificationToken: string,
		verificationTokenTtlMs: number,
	): User {
		const emailVo = new Email(emailString);
		const verificationTokenExpiration = new Date(Date.now() + verificationTokenTtlMs);

		const account = new Account(
			accountId,
			passwordHash,
			verificationToken,
			verificationTokenExpiration,
		);

		return new User(id, emailVo, name, false, role, account, null);
	}
}
