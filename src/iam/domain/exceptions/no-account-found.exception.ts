import { DomainException } from "./domain.exception";

export class NoAccountFoundException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}
