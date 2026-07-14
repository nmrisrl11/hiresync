import { Injectable } from "@nestjs/common";
import {
	UpdateAccountCommand,
	UpdateAccountResult,
	UpdateAccountUseCasePort,
} from "../../ports/inbound/account";
import { IamRepositoryPort } from "../../ports/outbound";
import { UserNotFoundException } from "../../exceptions";

@Injectable()
export class UpdateAccountUseCase implements UpdateAccountUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(command: UpdateAccountCommand): Promise<UpdateAccountResult> {
		const user = await this.iamRepository.findById(command.userId);

		if (!user) throw new UserNotFoundException();

		user.updateProfile(command.name, command.image);

		await this.iamRepository.save(user);

		return {
			id: user.id,
			email: user.email.getValue(),
			name: user.name,
			image: user.image,
			role: user.role.code,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		};
	}
}
