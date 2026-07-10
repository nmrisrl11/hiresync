import { ApplicationException } from "./application.exception";

export class InvalidLoginException extends ApplicationException {
	constructor(message: string) {
		super(message);
	}
}
