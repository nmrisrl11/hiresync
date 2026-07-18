export class AccountId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("AccountId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: AccountId): boolean {
		return this.value === other.getValue();
	}
}
