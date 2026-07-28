export class FailedLoginState {
	constructor(
		private readonly count: number = 0,
		private readonly lockedUntil: Date | null = null,
	) {
		if (count < 0) {
			throw new Error("Failed login attempts cannot be negative.");
		}
	}

	public getCount(): number {
		return this.count;
	}

	public getLockedUntil(): Date | null {
		return this.lockedUntil;
	}

	public isLocked(): boolean {
		if (!this.lockedUntil) return false;
		return this.lockedUntil > new Date();
	}

	public recordFailure(maxAttempts: number, lockoutDurationMs: number): FailedLoginState {
		const newCount = this.count + 1;
		let newLockedUntil = this.lockedUntil;

		if (newCount >= maxAttempts) {
			newLockedUntil = new Date(Date.now() + lockoutDurationMs);
		}

		return new FailedLoginState(newCount, newLockedUntil);
	}

	public reset(): FailedLoginState {
		return new FailedLoginState(0, null);
	}
}
