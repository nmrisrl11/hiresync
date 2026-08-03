export class UserId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("UserId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: UserId): boolean {
		return this.value === other.getValue();
	}
}
