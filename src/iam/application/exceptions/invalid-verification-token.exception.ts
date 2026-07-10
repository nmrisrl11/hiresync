import { ApplicationException } from "./application.exception";

export class InvalidVerificationTokenException extends ApplicationException {
	constructor(message: string) {
		super(message);
	}
}
