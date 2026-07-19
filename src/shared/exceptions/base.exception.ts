export abstract class BaseException extends Error {
	protected constructor(message: string) {
		super(message);
		this.name = new.target.name;
	}
}
