export class RoleCode {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("RoleCode cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}
}
