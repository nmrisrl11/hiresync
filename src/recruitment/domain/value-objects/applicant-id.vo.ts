export class ApplicantId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("ApplicantId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: ApplicantId): boolean {
		return this.value === other.getValue();
	}
}
