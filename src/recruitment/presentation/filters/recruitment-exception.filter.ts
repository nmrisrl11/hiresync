import {
	EmployerProfileAlreadyExistsException,
	EmployerProfileNotFoundException,
	JobListingNotFoundException,
	UnauthorizedJobListingException,
} from "@/recruitment/application/exceptions";
import { ApplicationBaseException, DomainBaseException } from "@/shared/exceptions/base.exception";
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch(ApplicationBaseException, DomainBaseException)
export class RecruitmentExceptionFilter implements ExceptionFilter<
	ApplicationBaseException | DomainBaseException
> {
	private getDomainStatus(exception: DomainBaseException): HttpStatus {
		//! TODO: Add Domain Exceptions here for Recruitment
		switch (exception.constructor) {
			default:
				return HttpStatus.INTERNAL_SERVER_ERROR;
		}
	}

	private getApplicationStatus(exception: ApplicationBaseException): HttpStatus {
		switch (exception.constructor) {
			case UnauthorizedJobListingException:
				return HttpStatus.FORBIDDEN;
			case EmployerProfileAlreadyExistsException:
				return HttpStatus.CONFLICT;
			case EmployerProfileNotFoundException:
			case JobListingNotFoundException:
				return HttpStatus.NOT_FOUND;
			default:
				return HttpStatus.INTERNAL_SERVER_ERROR;
		}
	}

	private getStatus(exception: ApplicationBaseException | DomainBaseException): HttpStatus {
		if (exception instanceof DomainBaseException) {
			return this.getDomainStatus(exception);
		}

		return this.getApplicationStatus(exception);
	}

	catch(exception: ApplicationBaseException | DomainBaseException, host: ArgumentsHost): void {
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
