export class OAuthAccountId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("OAuthAccountId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: OAuthAccountId): boolean {
		return this.value === other.getValue();
	}
}
