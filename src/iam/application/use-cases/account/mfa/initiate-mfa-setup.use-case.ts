import { UserNotFoundException } from "@/iam/application/exceptions";
import {
	InitiateMfaSetupCommand,
	InitiateMfaSetupResult,
	InitiateMfaSetupUseCasePort,
} from "@/iam/application/ports/inbound/account/mfa";
import { MfaServicePort } from "@/iam/application/ports/outbound";
import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InitiateMfaSetupUseCase implements InitiateMfaSetupUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly mfaService: MfaServicePort,
	) {}

	public async execute(command: InitiateMfaSetupCommand): Promise<InitiateMfaSetupResult> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user || !user.account) throw new UserNotFoundException();

		//! Generate Base32 secret and QR Code via MfaServicePort
		const { qrCodeUrl, secret } = await this.mfaService.generateSecret(user.email.getValue());

		//! Store as pendingSecret in domain entity (does not enable MFA yet)
		user.initiateMfaSetup(secret);

		await this.userRepository.save(user);

		return { qrCodeUrl, secret };
	}
}
