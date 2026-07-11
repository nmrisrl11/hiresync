import { Injectable, Logger } from "@nestjs/common";
import {
	ResetPasswordCommand,
	ResetPasswordResult,
	ResetPasswordUseCasePort,
} from "../ports/inbound";
import { HashServicePort, IamRepositoryPort } from "../ports/outbound";

@Injectable()
export class ResetPasswordUseCase implements ResetPasswordUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly hashService: HashServicePort,
	) {}

	private logger = new Logger(ResetPasswordUseCase.name);

	public async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
		const user = await this.iamRepository.findByResetToken(command.token);

		//! change this to be exception
		if (!user || !user.account?.getResetToken())
			return {
				message: "Invalid reset token.",
			};

		const passwordHash = await this.hashService.hash(command.password, 12);

		user.changePassword(command.token, passwordHash);
		await this.iamRepository.save(user);

		return { message: "Password reset successful. You can now login." };
	}
}
