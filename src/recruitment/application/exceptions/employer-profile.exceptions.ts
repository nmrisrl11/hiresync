import { ApplicationBaseException } from "@/shared/exceptions/base.exception";

export class EmployerProfileAlreadyExistsException extends ApplicationBaseException {
	constructor(message: string = "User already has an employer profile.") {
		super(message);
	}
}

export class EmployerProfileNotFoundException extends ApplicationBaseException {
	constructor(message: string = "You must create an employer profile before posting a job.") {
		super(message);
	}
}
