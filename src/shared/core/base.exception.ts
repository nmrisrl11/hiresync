export abstract class ApplicationBaseException extends Error {
	protected constructor(message: string) {
		super(message);
		this.name = new.target.name;
	}
}

export abstract class DomainBaseException extends Error {
	protected constructor(message: string) {
		super(message);
		this.name = new.target.name;
	}
}
