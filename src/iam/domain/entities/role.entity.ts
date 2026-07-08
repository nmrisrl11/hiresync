export class Role {
	constructor(
		public readonly id: string,
		public readonly code: string,
		public readonly description: string | null,
	) {}

	public isAdmin(): boolean {
		return this.code === "ADMIN";
	}
}
