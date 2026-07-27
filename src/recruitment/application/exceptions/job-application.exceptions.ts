import { ApplicationBaseException } from "@/shared/core";

export class JobApplicationNotFoundException extends ApplicationBaseException {
	constructor(message: string = "Job application not found.") {
		super(message);
	}
}

export class DuplicateJobApplicationException extends ApplicationBaseException {
	constructor(message: string = "You have already applied for this job listing.") {
		super(message);
	}
}

export class JobNotAcceptingApplicationsException extends ApplicationBaseException {
	constructor(message: string = "This job listing is no longer accepting applications.") {
		super(message);
	}
}

export class UnauthorizedApplicationAccessException extends ApplicationBaseException {
	constructor(message: string = "You do not have permission to modify this application.") {
		super(message);
	}
}
