import { DomainException } from "./domain.exception";

export class ResetTokenExpiredException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}
