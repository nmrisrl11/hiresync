import { ApplicationException } from "./application.exception";

export class EmailDispatchFailedException extends ApplicationException {
	constructor(message: string) {
		super(message);
	}
}
