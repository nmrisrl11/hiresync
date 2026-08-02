import { DomainBaseException } from "@/shared/core";

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

export class InvalidMfaConfigurationException extends DomainBaseException {
	constructor(message = "Invalid MFA configuration state.") {
		super(message);
	}
}

export class InvalidMfaTokenException extends DomainBaseException {
	constructor(message = "Invalid or expired MFA verification code.") {
		super(message);
	}
}

export class InvalidMfaRecoveryCodeException extends DomainBaseException {
	constructor(message = "Invalid or already consumed backup recovery code.") {
		super(message);
	}
}

export class MfaNotEnabledException extends DomainBaseException {
	constructor(message = "Multi-factor authentication is not enabled for this account.") {
		super(message);
	}
}

export class InvalidOAuthProviderException extends DomainBaseException {
	constructor(message: string = "The provided OAuth provider is unsupported or invalid.") {
		super(message);
	}
}
