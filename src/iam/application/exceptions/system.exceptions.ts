import { ApplicationException } from "./application.exception";

export class EmailDispatchFailedException extends ApplicationException {
	constructor(
		message: string = "We are currently experiencing issues sending emails. Please try again later.",
	) {
		super(message);
	}
}
