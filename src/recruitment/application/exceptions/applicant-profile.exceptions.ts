import { ApplicationBaseException } from "@/shared/core";

export class ApplicantProfileAlreadyExistsException extends ApplicationBaseException {
	constructor(message: string = "An applicant profile already exists for this user.") {
		super(message);
	}
}

export class ApplicantProfileNotFoundException extends ApplicationBaseException {
	constructor(message: string = "Applicant profile not found.") {
		super(message);
	}
}

export class UnauthorizedApplicantAccessException extends ApplicationBaseException {
	constructor(
		message: string = "You cannot view this applicant's profile because they have not applied to any of your job listings.",
	) {
		super(message);
	}
}
