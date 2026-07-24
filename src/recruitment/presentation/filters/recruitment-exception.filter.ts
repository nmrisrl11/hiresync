import {
	ApplicantProfileAlreadyExistsException,
	ApplicantProfileNotFoundException,
	DuplicateJobApplicationException,
	EmployerProfileAlreadyExistsException,
	EmployerProfileNotFoundException,
	JobApplicationNotFoundException,
	JobListingNotFoundException,
	JobNotAcceptingApplicationsException,
	UnauthorizedApplicantAccessException,
	UnauthorizedApplicationAccessException,
	UnauthorizedJobListingException,
} from "@/recruitment/application/exceptions";
import {
	JobAlreadyClosedException,
	JobNotUpdatableException,
} from "@/recruitment/domain/exceptions";
import { ApplicationBaseException, DomainBaseException } from "@/shared/exceptions/base.exception";
import { BaseExceptionFilter } from "@/shared/presentation/filters/base-exception.filter";
import { Catch, HttpStatus } from "@nestjs/common";

@Catch(ApplicationBaseException, DomainBaseException)
export class RecruitmentExceptionFilter extends BaseExceptionFilter {
	private getDomainStatus(exception: DomainBaseException): HttpStatus {
		switch (exception.constructor) {
			case JobNotUpdatableException:
			case JobAlreadyClosedException:
				return HttpStatus.CONFLICT;
			default:
				return HttpStatus.INTERNAL_SERVER_ERROR;
		}
	}

	private getApplicationStatus(exception: ApplicationBaseException): HttpStatus {
		switch (exception.constructor) {
			case UnauthorizedJobListingException:
			case UnauthorizedApplicationAccessException:
			case UnauthorizedApplicantAccessException:
				return HttpStatus.FORBIDDEN;
			case EmployerProfileAlreadyExistsException:
			case ApplicantProfileAlreadyExistsException:
			case DuplicateJobApplicationException:
			case JobNotAcceptingApplicationsException:
				return HttpStatus.CONFLICT;
			case EmployerProfileNotFoundException:
			case JobListingNotFoundException:
			case ApplicantProfileNotFoundException:
			case JobApplicationNotFoundException:
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
