import { DomainBaseException } from "@/shared/exceptions/base.exception";

export class InvalidEmailFormatException extends DomainBaseException {
	constructor(message: string = "The provided email format is invalid.") {
		super(message);
	}
}

export class InvalidVerificationTokenException extends DomainBaseException {
	constructor(message: string = "The verification token is invalid.") {
		super(message);
	}
}

export class ExpiredVerificationTokenException extends DomainBaseException {
	constructor(message: string = "The verification token is expired.") {
		super(message);
	}
}

export class InvalidResetTokenException extends DomainBaseException {
	constructor(message: string = "The password reset token is invalid.") {
		super(message);
	}
}

export class ExpiredResetTokenException extends DomainBaseException {
	constructor(message: string = "The password reset token is expired.") {
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
