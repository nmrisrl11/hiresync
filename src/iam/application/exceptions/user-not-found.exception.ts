import { ApplicationException } from "./application.exception";

export class UserNotFoundException extends ApplicationException {
	constructor(message: string) {
		super(message);
	}
}
