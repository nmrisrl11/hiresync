import { ApplicationBaseException } from "@/shared/core";

export class InvalidLoginException extends ApplicationBaseException {
	constructor(message: string = "Invalid email or password.") {
		super(message);
	}
}

export class UserAlreadyExistsException extends ApplicationBaseException {
	constructor(message: string = "An account with this email already exists.") {
		super(message);
	}
}

export class UserNotFoundException extends ApplicationBaseException {
	constructor(message: string = "User not found.") {
		super(message);
	}
}

export class InvalidTokenException extends ApplicationBaseException {
	constructor(message: string = "The token is not found or invalid.") {
		super(message);
	}
}

export class InvalidPasswordException extends ApplicationBaseException {
	constructor(message: string = "The current password provided is incorrect.") {
		super(message);
	}
}
