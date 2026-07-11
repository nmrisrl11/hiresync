import { ApplicationException } from "./application.exception";

export class RoleNotFoundException extends ApplicationException {
	constructor(message: string = "The specified role does not exist.") {
		super(message);
	}
}

export class UnauthorizedRoleException extends ApplicationException {
	constructor(message: string = "You do not have permission to perform this action.") {
		super(message);
	}
}
