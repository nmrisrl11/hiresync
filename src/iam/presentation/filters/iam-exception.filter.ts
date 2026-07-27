import {
	InvalidLoginException,
	InvalidPasswordException,
	InvalidTokenException,
	RoleNotFoundException,
	UnauthorizedRoleException,
	UserAlreadyExistsException,
	UserNotFoundException,
} from "@/iam/application/exceptions";
import {
	ExpiredResetTokenException,
	ExpiredVerificationTokenException,
	InvalidEmailFormatException,
	InvalidResetTokenException,
	InvalidVerificationTokenException,
	NoAccountFoundException,
	NoPendingEmailChangeException,
} from "@/iam/domain/exceptions";
import { ApplicationBaseException, DomainBaseException } from "@/shared/core";
import { BaseExceptionFilter } from "@/shared/http/filters/base-exception.filter";
import { Catch, HttpStatus } from "@nestjs/common";

@Catch(ApplicationBaseException, DomainBaseException)
export class IamExceptionFilter extends BaseExceptionFilter {
	private getDomainStatus(exception: DomainBaseException): HttpStatus {
		switch (exception.constructor) {
			case InvalidEmailFormatException:
			case InvalidVerificationTokenException:
			case ExpiredVerificationTokenException:
			case InvalidResetTokenException:
			case ExpiredResetTokenException:
			case NoPendingEmailChangeException:
				return HttpStatus.BAD_REQUEST;
			case NoAccountFoundException:
				return HttpStatus.NOT_FOUND;
			default:
				return HttpStatus.INTERNAL_SERVER_ERROR;
		}
	}

	private getApplicationStatus(exception: ApplicationBaseException): HttpStatus {
		switch (exception.constructor) {
			case InvalidLoginException:
				return HttpStatus.UNAUTHORIZED;
			case InvalidTokenException:
			case RoleNotFoundException:
			case InvalidPasswordException:
				return HttpStatus.BAD_REQUEST;
			case UnauthorizedRoleException:
				return HttpStatus.FORBIDDEN;
			case UserAlreadyExistsException:
				return HttpStatus.CONFLICT;
			case UserNotFoundException:
				return HttpStatus.NOT_FOUND;
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
