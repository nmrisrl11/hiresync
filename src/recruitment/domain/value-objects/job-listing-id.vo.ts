export class JobListingId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("JobListingId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: JobListingId): boolean {
		return this.value === other.getValue();
	}
}
