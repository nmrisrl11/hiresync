import { SessionId, UserId } from "../value-objects";

export class Session {
	constructor(
		public readonly id: SessionId,
		public readonly userId: UserId,
		private refreshTokenHash: string,
		public readonly userAgent: string | null,
		public readonly ipAddress: string | null,
		private isRevoked: boolean,
		private lastActiveAt: Date,
		public readonly expiresAt: Date,
		public readonly createdAt: Date,
	) {}

	public getRefreshTokenHash(): string {
		return this.refreshTokenHash;
	}

	public getIsRevoked(): boolean {
		return this.isRevoked;
	}

	public getLastActiveAt(): Date {
		return this.lastActiveAt;
	}

	public isExpired(): boolean {
		return new Date() > this.expiresAt;
	}

	public isValid(): boolean {
		return !this.isRevoked && !this.isExpired();
	}

	public revoke(): void {
		this.isRevoked = true;
	}

	public rotateToken(newHash: string): void {
		this.refreshTokenHash = newHash;
		this.lastActiveAt = new Date();
	}
}
