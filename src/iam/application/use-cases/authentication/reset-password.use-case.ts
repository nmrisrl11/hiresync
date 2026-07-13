import { Injectable } from "@nestjs/common";
import { InvalidTokenException } from "../../exceptions";
import { HashServicePort, IamRepositoryPort } from "../../ports/outbound";
import {
	ResetPasswordCommand,
	ResetPasswordResult,
	ResetPasswordUseCasePort,
} from "../../ports/inbound/authentication";

@Injectable()
export class ResetPasswordUseCase implements ResetPasswordUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly hashService: HashServicePort,
	) {}

	public async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
		const user = await this.iamRepository.findByResetToken(command.token);

		if (!user || !user.account?.getResetToken())
			throw new InvalidTokenException("Reset token not found or invalid.");

		const passwordHash = await this.hashService.hash(command.password, 12);

		user.changePassword(command.token, passwordHash);

		await this.iamRepository.save(user);

		return { message: "Password reset successful. You can now login." };
	}
}
