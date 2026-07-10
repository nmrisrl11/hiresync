import { DomainException } from "./domain.exception";

export class InvalidEmailFormatException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}
