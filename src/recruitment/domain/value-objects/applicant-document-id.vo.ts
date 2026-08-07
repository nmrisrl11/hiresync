export class ApplicantDocumentId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("ApplicantDocumentId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}

	public equals(other: ApplicantDocumentId): boolean {
		return this.value === other.getValue();
	}
}
