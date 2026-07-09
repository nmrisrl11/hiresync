import { Injectable } from "@nestjs/common";
import { LogoutCommand, LogoutUseCasePort } from "../ports/inbound/logout.in-port";
import { IamRepositoryPort } from "../ports/outbound/iam.repository.port";
import { UserNotFoundException } from "../exceptions/application.exception";

@Injectable()
export class LogoutUseCase implements LogoutUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(command: LogoutCommand): Promise<void> {
		const user = await this.iamRepository.findById(command.userId);

		if (!user) throw new UserNotFoundException("User not found.");

		user.account?.updateRefreshTokenHash(null);

		await this.iamRepository.save(user);
	}
}
