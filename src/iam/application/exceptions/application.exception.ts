export class UserAlreadyExistsException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserAlreadyExistsException";
	}
}

export class RoleNotFoundException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "RoleNotFoundException";
	}
}
