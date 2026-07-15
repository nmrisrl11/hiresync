import { Injectable } from "@nestjs/common";
import {
	RemoveAvatarCommand,
	RemoveAvatarUseCasePort,
	UpdateAccountResult,
} from "../../ports/inbound/account";
import { IamRepositoryPort, ImageStoragePort } from "../../ports/outbound";
import { UserNotFoundException } from "../../exceptions";
import { LoggerPort } from "@/shared/logger/ports/logger.port";

@Injectable()
export class RemoveAvatarUseCase implements RemoveAvatarUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly imageStorage: ImageStoragePort,
		private readonly logger: LoggerPort,
	) {}

	public async execute(command: RemoveAvatarCommand): Promise<UpdateAccountResult> {
		const user = await this.iamRepository.findById(command.userId);
		if (!user) throw new UserNotFoundException();

		if (user.image) {
			await this.imageStorage.deleteImage(user.image).catch(() => {
				this.logger.error(`Failed to delete image from Cloudinary: ${user.image}`);
			});

			user.updateProfile(undefined, null);

			await this.iamRepository.save(user);
		}

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
