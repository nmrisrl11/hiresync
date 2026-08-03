import { UserNotFoundException } from "@/iam/application/exceptions";
import {
	UnlinkOAuthProviderCommand,
	UnlinkOAuthProviderUseCasePort,
} from "@/iam/application/ports/inbound/account/oauth";
import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UnlinkOAuthProviderUseCase implements UnlinkOAuthProviderUseCasePort {
	constructor(private readonly userRepository: UserRepository) {}

	public async execute(command: UnlinkOAuthProviderCommand): Promise<void> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);
		if (!user) throw new UserNotFoundException();

		user.unlinkOAuthProvider(command.provider);

		await this.userRepository.save(user);
	}
}
