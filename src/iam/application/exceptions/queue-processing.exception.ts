import { ApplicationException } from "./application.exception";

export class QueueProcessingException extends ApplicationException {
	constructor(message: string) {
		super(message);
	}
}
