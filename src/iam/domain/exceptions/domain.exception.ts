export class InvalidDomainStateException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidDomainStateException";
	}
}
