import { DomainBaseException } from "@/shared/core";

export class JobNotUpdatableException extends DomainBaseException {
	constructor(message: string = "Cannot update a closed or expired job listing.") {
		super(message);
	}
}

export class JobAlreadyClosedException extends DomainBaseException {
	constructor(message: string = "The job listing is already closed.") {
		super(message);
	}
}

export class ApplicationNotUpdatableException extends DomainBaseException {
	constructor(message: string = "Application is already finalized and cannot be withdrawn.") {
		super(message);
	}
}

export class MaxDocumentLimitReachedException extends DomainBaseException {
	constructor(type: string, limit: number = 5) {
		super(`Maximum limit of ${limit} ${type}s reached. Please delete an existing document first.`);
	}
}

export class DocumentNotFoundException extends DomainBaseException {
	constructor(message: string = "The requested document could not be found in your profile.") {
		super(message);
	}
}
