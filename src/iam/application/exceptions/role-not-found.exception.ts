import { ApplicationException } from "./application.exception";

export class RoleNotFoundException extends ApplicationException {
	constructor(message: string) {
		super(message);
	}
}
