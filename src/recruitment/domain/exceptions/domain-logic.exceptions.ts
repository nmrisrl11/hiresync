import { DomainBaseException } from "@/shared/exceptions/base.exception";

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
