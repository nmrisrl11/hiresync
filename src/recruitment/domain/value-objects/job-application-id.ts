export class JobApplicationId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("JobApplicationId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: JobApplicationId): boolean {
		return this.value === other.getValue();
	}
}
