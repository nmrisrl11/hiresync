import { ApplicationBaseException } from "@/shared/core";

export class EmployerProfileAlreadyExistsException extends ApplicationBaseException {
	constructor(message: string = "User already has an employer profile.") {
		super(message);
	}
}

export class EmployerProfileNotFoundException extends ApplicationBaseException {
	constructor(
		message: string = "Employer profile not found. You must create an employer profile before managing a job.",
	) {
		super(message);
	}
}
