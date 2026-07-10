import { ApplicationException } from "./application.exception";

export class UserAlreadyExistsException extends ApplicationException {
	constructor(message: string) {
		super(message);
	}
}
