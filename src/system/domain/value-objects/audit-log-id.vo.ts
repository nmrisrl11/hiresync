export class AuditLogId {
	constructor(private readonly value: string) {
		if (!value || value.trim() === "") {
			throw new Error("AuditLogId cannot be empty.");
		}
	}

	public getValue(): string {
		return this.value;
	}
}
