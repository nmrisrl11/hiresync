export class EmployerId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("EmployerId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: EmployerId): boolean {
		return this.value === other.getValue();
	}
}
