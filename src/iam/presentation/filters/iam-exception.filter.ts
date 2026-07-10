import {
	ApplicationException,
	EmailDispatchFailedException,
	InvalidVerificationTokenException as InvalidApplicationVerificationTokenException,
	InvalidLoginException,
	RoleNotFoundException,
	UnauthorizedRoleException,
	UserAlreadyExistsException,
	UserNotFoundException,
} from "@/iam/application/exceptions";
import {
	DomainException,
	InvalidVerificationTokenException as InvalidDomainVerificationTokenException,
	InvalidEmailFormatException,
	NoAccountFoundException,
	VerificationTokenExpiredException,
} from "@/iam/domain/exceptions";
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch(ApplicationException, DomainException)
export class IamExceptionFilter implements ExceptionFilter<ApplicationException | DomainException> {
	private getDomainStatus(exception: DomainException): HttpStatus {
		switch (exception.constructor) {
			case InvalidEmailFormatException:
			case InvalidDomainVerificationTokenException:
			case VerificationTokenExpiredException:
				return HttpStatus.BAD_REQUEST;
			case NoAccountFoundException:
				return HttpStatus.NOT_FOUND;
			default:
				return HttpStatus.INTERNAL_SERVER_ERROR;
		}
	}

	private getApplicationStatus(exception: ApplicationException): HttpStatus {
		switch (exception.constructor) {
			case InvalidLoginException:
				return HttpStatus.UNAUTHORIZED;
			case InvalidApplicationVerificationTokenException:
			case RoleNotFoundException:
				return HttpStatus.BAD_REQUEST;
			case UnauthorizedRoleException:
				return HttpStatus.FORBIDDEN;
			case UserAlreadyExistsException:
				return HttpStatus.CONFLICT;
			case UserNotFoundException:
				return HttpStatus.NOT_FOUND;
			case EmailDispatchFailedException:
			default:
				return HttpStatus.INTERNAL_SERVER_ERROR;
		}
	}

	private getStatus(exception: ApplicationException | DomainException): HttpStatus {
		if (exception instanceof DomainException) {
			return this.getDomainStatus(exception);
		}

		return this.getApplicationStatus(exception);
	}

	catch(exception: ApplicationException | DomainException, host: ArgumentsHost): void {
		const response = host.switchToHttp().getResponse<Response>();
		const status = this.getStatus(exception);

		response.status(status).json({
			statusCode: status,
			message: exception.message,
			error: exception.name,
			timestamp: new Date().toISOString(),
		});
	}
}
