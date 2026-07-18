import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import {
	UpdateAccountCommand,
	UpdateAccountResult,
	UpdateAccountUseCasePort,
} from "../../ports/inbound/account";

@Injectable()
export class UpdateAccountUseCase implements UpdateAccountUseCasePort {
	constructor(private readonly userRepository: UserRepository) {}

	public async execute(command: UpdateAccountCommand): Promise<UpdateAccountResult> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);

		if (!user) throw new UserNotFoundException();

		user.updateProfile(command.name, command.image);

		await this.userRepository.save(user);

		return {
			id: user.id.getValue(),
			email: user.email.getValue(),
			name: user.name,
			image: user.image,
			role: user.role.code.getValue(),
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		};
	}
}
