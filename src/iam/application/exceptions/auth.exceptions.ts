import { ApplicationException } from "./application.exception";

export class InvalidLoginException extends ApplicationException {
	constructor(message: string = "Invalid email or password.") {
		super(message);
	}
}

export class UserAlreadyExistsException extends ApplicationException {
	constructor(message: string = "An account with this email already exists.") {
		super(message);
	}
}

export class UserNotFoundException extends ApplicationException {
	constructor(message: string = "User not found.") {
		super(message);
	}
}

export class InvalidTokenException extends ApplicationException {
	constructor(message: string = "The token is not found or invalid.") {
		super(message);
	}
}

export class InvalidPasswordException extends ApplicationException {
	constructor(message: string = "The current password provided is incorrect.") {
		super(message);
	}
}
