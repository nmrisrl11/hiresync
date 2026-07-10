import { DomainException } from "./domain.exception";

export class VerificationTokenExpiredException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}
