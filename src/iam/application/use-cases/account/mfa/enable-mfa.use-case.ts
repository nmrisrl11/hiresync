import { UserNotFoundException } from "@/iam/application/exceptions";
import {
	EnableMfaCommand,
	EnableMfaResult,
	EnableMfaUseCasePort,
} from "@/iam/application/ports/inbound/account/mfa";
import {
	BackupCodesGeneratorPort,
	HashServicePort,
	MfaServicePort,
} from "@/iam/application/ports/outbound";
import { InvalidMfaTokenException } from "@/iam/domain/exceptions";
import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EnableMfaUseCase implements EnableMfaUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly mfaService: MfaServicePort,
		private readonly hashService: HashServicePort,
		private readonly backupCodesGenerator: BackupCodesGeneratorPort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: EnableMfaCommand): Promise<EnableMfaResult> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user || !user.account) throw new UserNotFoundException();

		const pendingSecret = user.account.getMfaConfiguration().getPendingSecret();
		if (!pendingSecret) throw new InvalidMfaTokenException("No pending MFA setup found.");

		//! Verify the 6-digit TOTP code against the pending secret
		const isValid = this.mfaService.verifyTotpToken(pendingSecret, command.code);
		if (!isValid) throw new InvalidMfaTokenException();

		//! Generate 10 plaintext backup codes (e.g., "4A8F-9C2E")
		const plaintextBackupCodes = this.backupCodesGenerator.generateBackupCodes(10);

		//! Hash each backup code before passing to Domain Entity
		const hashedBackupCodes = await Promise.all(
			plaintextBackupCodes.map((code) => this.hashService.hash(code, 10)),
		);

		//! Promote pendingSecret to live secret and enable MFA
		user.enableMfa(hashedBackupCodes);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();

		//! Return plaintext ONCE to the user
		return { backupCodes: plaintextBackupCodes };
	}
}
