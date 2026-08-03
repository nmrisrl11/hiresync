import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { LoggerPort } from "@/shared/logger/ports/logger.port";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import {
	RemoveAvatarCommand,
	RemoveAvatarUseCasePort,
	UpdateAccountResult,
} from "../../ports/inbound/account";
import { ImageStoragePort } from "../../ports/outbound";

@Injectable()
export class RemoveAvatarUseCase implements RemoveAvatarUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly imageStorage: ImageStoragePort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(command: RemoveAvatarCommand): Promise<UpdateAccountResult> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);
		if (!user) throw new UserNotFoundException();

		if (user.image) {
			await this.imageStorage.deleteImage(user.image).catch(() => {
				this.logger.error(`Failed to delete image from Cloudinary: ${user.image}`);
			});

			user.updateProfile(undefined, null);

			await this.userRepository.save(user);
		}

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
