import { DomainBaseException } from "@/shared/exceptions/base.exception";

export class InvalidEmailFormatException extends DomainBaseException {
	constructor(message: string = "The provided email format is invalid.") {
		super(message);
	}
}

export class InvalidTokenException extends DomainBaseException {
	constructor(message: string = "The token is not found, expired or invalid.") {
		super(message);
	}
}

export class NoAccountFoundException extends DomainBaseException {
	constructor(message: string = "No account credentials found for this user.") {
		super(message);
	}
}

export class NoPendingEmailChangeException extends DomainBaseException {
	constructor(message: string = "No pending email change request found.") {
		super(message);
	}
}
