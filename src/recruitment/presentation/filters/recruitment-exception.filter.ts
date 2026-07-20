import {
	EmployerProfileAlreadyExistsException,
	EmployerProfileNotFoundException,
	JobListingNotFoundException,
	UnauthorizedJobListingException,
} from "@/recruitment/application/exceptions";
import { ApplicationBaseException, DomainBaseException } from "@/shared/exceptions/base.exception";
import { BaseExceptionFilter } from "@/shared/presentation/filters/base-exception.filter";
import { Catch, HttpStatus } from "@nestjs/common";

@Catch(ApplicationBaseException, DomainBaseException)
export class RecruitmentExceptionFilter extends BaseExceptionFilter {
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

	protected getStatus(exception: ApplicationBaseException | DomainBaseException): HttpStatus {
		if (exception instanceof DomainBaseException) {
			return this.getDomainStatus(exception);
		}
		return this.getApplicationStatus(exception);
	}
}
