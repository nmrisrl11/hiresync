import { InvalidDomainStateException } from "../exceptions";

export class Email {
	private readonly value: string;

	constructor(email: string) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new InvalidDomainStateException("Invalid email format.");
		}
		this.value = email.toLowerCase().trim();
	}

	public getValue(): string {
		return this.value;
	}
}
