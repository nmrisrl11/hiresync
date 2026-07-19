import { ApplicationBaseException } from "@/shared/exceptions/base.exception";

export class JobListingNotFoundException extends ApplicationBaseException {
	constructor(message: string = "Job listing not found.") {
		super(message);
	}
}

export class UnauthorizedJobListingException extends ApplicationBaseException {
	constructor(message: string = "You do not have permission to perform this action.") {
		super(message);
	}
}
