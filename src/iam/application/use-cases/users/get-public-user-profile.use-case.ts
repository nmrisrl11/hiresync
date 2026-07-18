import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import {
	GetPublicUserProfileQuery,
	GetPublicUserProfileUseCasePort,
	PublicUserResult,
} from "../../ports/inbound/users";

@Injectable()
export class GetPublicUserProfileUseCase implements GetPublicUserProfileUseCasePort {
	constructor(private readonly userRepository: UserRepository) {}

	public async execute(query: GetPublicUserProfileQuery): Promise<PublicUserResult> {
		const userIdVo = new UserId(query.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		return {
			id: user.id.getValue(),
			name: user.name,
			image: user.image,
			role: user.role.code.getValue(),
		};
	}
}
