import { DomainException } from "./domain.exception";

export class InvalidVerificationTokenException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}
