import { UserNotFoundException } from "@/iam/application/exceptions";
import { GetConnectedOAuthProvidersUseCasePort } from "@/iam/application/ports/inbound/account/oauth";
import { UserRepository } from "@/iam/domain/repositories";
import { OAuthProviderType } from "@/iam/domain/types";
import { UserId } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GetConnectedOAuthProvidersUseCase implements GetConnectedOAuthProvidersUseCasePort {
	constructor(private readonly userRepository: UserRepository) {}

	public async execute(userId: string): Promise<OAuthProviderType[]> {
		const userIdVo = new UserId(userId);
		const user = await this.userRepository.findById(userIdVo);
		if (!user) throw new UserNotFoundException();

		return user.getOAuthAccounts().map((oa) => oa.getProviderValue());
	}
}
