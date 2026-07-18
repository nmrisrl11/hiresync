import { RoleCode, RoleId } from "../value-objects";

export class Role {
	constructor(
		public readonly id: RoleId,
		public readonly code: RoleCode,
		public readonly description: string | null,
	) {}

	public isAdmin(): boolean {
		return this.code.getValue() === "ADMIN";
	}
}
