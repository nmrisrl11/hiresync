import { ApplicationBaseException } from "@/shared/core";

export class RoleNotFoundException extends ApplicationBaseException {
	constructor(message: string = "The specified role does not exist.") {
		super(message);
	}
}

export class UnauthorizedRoleException extends ApplicationBaseException {
	constructor(message: string = "You do not have permission to perform this action.") {
		super(message);
	}
}
