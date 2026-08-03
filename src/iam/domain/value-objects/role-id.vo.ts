export class RoleId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("RoleId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: RoleId): boolean {
		return this.value === other.getValue();
	}
}
