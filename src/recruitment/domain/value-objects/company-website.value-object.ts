export class CompanyWebsite {
	constructor(private readonly value: string) {
		if (!this.isValidUrl(value)) {
			throw new Error("Invalid company website URL.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: CompanyWebsite): boolean {
		return this.value === other.getValue();
	}

	private isValidUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	}
}
