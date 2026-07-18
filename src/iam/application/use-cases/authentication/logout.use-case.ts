import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import { LogoutCommand, LogoutUseCasePort } from "../../ports/inbound/authentication";

@Injectable()
export class LogoutUseCase implements LogoutUseCasePort {
	constructor(private readonly userRepository: UserRepository) {}

	public async execute(command: LogoutCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		user.updateRefreshToken(null);

		await this.userRepository.save(user);
	}
}
