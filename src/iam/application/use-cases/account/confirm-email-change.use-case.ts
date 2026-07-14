import { Injectable } from "@nestjs/common";
import {
	ConfirmEmailChangeCommand,
	ConfirmEmailChangeUseCasePort,
} from "../../ports/inbound/account";
import { IamRepositoryPort } from "../../ports/outbound";
import { InvalidTokenException } from "../../exceptions";

@Injectable()
export class ConfirmEmailChangeUseCase implements ConfirmEmailChangeUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(command: ConfirmEmailChangeCommand): Promise<void> {
		const user = await this.iamRepository.findByVerificationToken(command.token);

		if (!user) throw new InvalidTokenException("Verification token not found or invalid.");

		user.confirmEmailChange(command.token);

		await this.iamRepository.save(user);
	}
}
