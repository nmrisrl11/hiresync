export class SessionId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("SessionId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: SessionId): boolean {
		return this.value === other.getValue();
	}
}
