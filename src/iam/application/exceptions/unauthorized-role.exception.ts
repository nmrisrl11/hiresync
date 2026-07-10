import { ApplicationException } from "./application.exception";

export class UnauthorizedRoleException extends ApplicationException {
	constructor(message: string) {
		super(message);
	}
}
