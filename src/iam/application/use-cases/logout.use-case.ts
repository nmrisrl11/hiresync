import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../exceptions";
import { LogoutCommand, LogoutUseCasePort } from "../ports/inbound";
import { IamRepositoryPort } from "../ports/outbound";

@Injectable()
export class LogoutUseCase implements LogoutUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(command: LogoutCommand): Promise<void> {
		const user = await this.iamRepository.findById(command.userId);

		if (!user) throw new UserNotFoundException();

		user.updateRefreshToken(null);

		await this.iamRepository.save(user);
	}
}
