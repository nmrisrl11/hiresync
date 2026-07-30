import { InvalidMfaConfigurationException, InvalidMfaRecoveryCodeException } from "../exceptions";

export class MfaConfiguration {
	constructor(
		private readonly isEnabled: boolean = false,
		private readonly secret: string | null = null,
		private readonly pendingSecret: string | null = null,
		private readonly backupCodes: string[] = [],
	) {
		if (this.isEnabled && !this.secret)
			throw new InvalidMfaConfigurationException("Cannot enable MFA without a valid secret.");
	}

	public static empty(): MfaConfiguration {
		return new MfaConfiguration(false, null, null, []);
	}

	public getIsEnabled(): boolean {
		return this.isEnabled;
	}

	public getSecret(): string | null {
		return this.secret;
	}

	public getPendingSecret(): string | null {
		return this.pendingSecret;
	}

	public getBackupCodes(): string[] {
		return this.backupCodes;
	}

	public initiateSetup(pendingSecret: string): MfaConfiguration {
		return new MfaConfiguration(this.isEnabled, this.secret, pendingSecret, this.backupCodes);
	}

	public enable(hashedBackupCodes: string[]): MfaConfiguration {
		if (!this.pendingSecret) {
			throw new InvalidMfaConfigurationException("No pending MFA setup found to enable.");
		}

		return new MfaConfiguration(
			true,
			this.pendingSecret, //! Promote pending secret to live secret
			null, //! Clear pending secret
			hashedBackupCodes,
		);
	}

	public disable(): MfaConfiguration {
		return MfaConfiguration.empty();
	}

	public consumeBackupCode(consumedHashedCode: string): MfaConfiguration {
		const remainingCodes = this.backupCodes.filter((code) => code !== consumedHashedCode);

		if (remainingCodes.length === this.backupCodes.length)
			throw new InvalidMfaRecoveryCodeException();

		return new MfaConfiguration(this.isEnabled, this.secret, this.pendingSecret, remainingCodes);
	}
}
