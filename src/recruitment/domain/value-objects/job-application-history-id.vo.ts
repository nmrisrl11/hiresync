export class JobApplicationHistoryId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("JobApplicationHistoryId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: JobApplicationHistoryId): boolean {
		return this.value === other.getValue();
	}
}
