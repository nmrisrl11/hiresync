import { DomainException } from "./domain.exception";

export class InvalidEmailFormatException extends DomainException {
	constructor(message: string = "The provided email format is invalid.") {
		super(message);
	}
}

export class InvalidTokenException extends DomainException {
	constructor(message: string = "The token is not found, expired or invalid.") {
		super(message);
	}
}

export class NoAccountFoundException extends DomainException {
	constructor(message: string = "No account credentials found for this user.") {
		super(message);
	}
}
