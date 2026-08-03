import {
	AccountLockedException,
	AccountPendingDeletionException,
	DefaultRoleMissingException,
	InvalidLoginException,
	InvalidMfaChallengeException,
	InvalidPasswordException,
	InvalidTokenException,
	OAuthEmailNotProvidedException,
	PasswordAlreadySetException,
	RoleNotFoundException,
	UnauthorizedRoleException,
	UserAlreadyExistsException,
	UserNotFoundException,
} from "@/iam/application/exceptions";
import {
	ExpiredResetTokenException,
	ExpiredVerificationTokenException,
	InvalidEmailFormatException,
	InvalidMfaConfigurationException,
	InvalidMfaRecoveryCodeException,
	InvalidMfaTokenException,
	InvalidOAuthProviderException,
	InvalidResetTokenException,
	InvalidVerificationTokenException,
	MfaNotEnabledException,
	NoAccountFoundException,
	NoPendingEmailChangeException,
} from "@/iam/domain/exceptions";
import { ApplicationBaseException, DomainBaseException } from "@/shared/core";
import { BaseExceptionFilter } from "@/shared/http/filters/base-exception.filter";
import { ArgumentsHost, Catch, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch(ApplicationBaseException, DomainBaseException)
export class IamExceptionFilter extends BaseExceptionFilter {
	//! Override the catch method to intercept the specific deletion exception
	public catch(
		exception: ApplicationBaseException | DomainBaseException,
		host: ArgumentsHost,
	): void {
		if (exception instanceof AccountPendingDeletionException) {
			const response = host.switchToHttp().getResponse<Response>();
			const status = HttpStatus.FORBIDDEN;

			response.status(status).json({
				statusCode: status,
				message: exception.message,
				error: exception.name,
				timestamp: new Date().toISOString(),
				scheduledDate: exception.scheduledDate,
			});
			return;
		}

		super.catch(exception, host);
	}

	private getDomainStatus(exception: DomainBaseException): HttpStatus {
		switch (exception.constructor) {
			case InvalidEmailFormatException:
			case InvalidVerificationTokenException:
			case ExpiredVerificationTokenException:
			case InvalidResetTokenException:
			case ExpiredResetTokenException:
			case NoPendingEmailChangeException:
			case InvalidOAuthProviderException:
				return HttpStatus.BAD_REQUEST;
			case NoAccountFoundException:
				return HttpStatus.NOT_FOUND;
			case InvalidMfaConfigurationException:
			case MfaNotEnabledException:
				return HttpStatus.CONFLICT;
			case InvalidMfaTokenException:
			case InvalidMfaRecoveryCodeException:
				return HttpStatus.UNAUTHORIZED;
			default:
				return HttpStatus.INTERNAL_SERVER_ERROR;
		}
	}

	private getApplicationStatus(exception: ApplicationBaseException): HttpStatus {
		switch (exception.constructor) {
			case AccountLockedException:
				return HttpStatus.TOO_MANY_REQUESTS;
			case InvalidLoginException:
			case InvalidMfaChallengeException:
				return HttpStatus.UNAUTHORIZED;
			case InvalidTokenException:
			case RoleNotFoundException:
			case InvalidPasswordException:
			case OAuthEmailNotProvidedException:
			case PasswordAlreadySetException:
				return HttpStatus.BAD_REQUEST;
			case UnauthorizedRoleException:
			case AccountPendingDeletionException:
				return HttpStatus.FORBIDDEN;
			case UserAlreadyExistsException:
				return HttpStatus.CONFLICT;
			case UserNotFoundException:
				return HttpStatus.NOT_FOUND;
			case DefaultRoleMissingException:
			default:
				return HttpStatus.INTERNAL_SERVER_ERROR;
		}
	}

	protected getStatus(exception: ApplicationBaseException | DomainBaseException): HttpStatus {
		if (exception instanceof DomainBaseException) {
			return this.getDomainStatus(exception);
		}

		return this.getApplicationStatus(exception);
	}
}
