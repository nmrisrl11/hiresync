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

export class UnauthorizedRoleException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UnauthorizedRoleException";
	}
}

export class InvalidVerificationTokenException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidVerificationTokenException";
	}
}

export class InvalidLoginException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidLoginException";
	}
}
