import { BaseException } from "@/shared/exceptions/base.exception";

export class EmployerProfileAlreadyExistsException extends BaseException {
	constructor(message: string = "User already has an employer profile.") {
		super(message);
	}
}

export class EmployerProfileNotFoundException extends BaseException {
	constructor(message: string = "You must create an employer profile before posting a job.") {
		super(message);
	}
}
