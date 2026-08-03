import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import { GetUserByIdQuery, GetUserByIdUseCasePort } from "../../ports/inbound/account";
import { UserResult } from "../../ports/inbound/users";

@Injectable()
export class GetUserByIdUseCase implements GetUserByIdUseCasePort {
	constructor(private readonly userRepository: UserRepository) {}

	public async execute(query: GetUserByIdQuery): Promise<UserResult> {
		const userIdVo = new UserId(query.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		return {
			id: user.id.getValue(),
			email: user.email.getValue(),
			name: user.name,
			image: user.image,
			role: user.role.code.getValue(),
			isVerified: user.isVerified,
			hasPassword: user.account?.hasPassword() ?? false,
			createdAt: user.createdAt,
		};
	}
}
