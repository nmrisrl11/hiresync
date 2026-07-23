import { ApplicationBaseException } from "@/shared/exceptions/base.exception";

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
