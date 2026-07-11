import { DomainException } from "./domain.exception";

export class InvalidResetTokenException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}
