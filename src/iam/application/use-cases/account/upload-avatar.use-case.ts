import { Injectable } from "@nestjs/common";
import {
	UpdateAccountResult,
	UploadAvatarCommand,
	UploadAvatarUseCasePort,
} from "../../ports/inbound/account";
import { IamRepositoryPort, ImageStoragePort } from "../../ports/outbound";
import { UserNotFoundException } from "../../exceptions";

@Injectable()
export class UploadAvatarUseCase implements UploadAvatarUseCasePort {
	constructor(
		private readonly iamRepository: IamRepositoryPort,
		private readonly imageStorage: ImageStoragePort,
	) {}

	public async execute(command: UploadAvatarCommand): Promise<UpdateAccountResult> {
		const user = await this.iamRepository.findById(command.userId);
		if (!user) throw new UserNotFoundException();

		//! For now if the user already has an image, delete the old one from Cloudinary to save space
		if (user.image) {
			await this.imageStorage.deleteImage(user.image).catch(() => {
				//! Silently fail if the old image wasn't found in Cloudinary
			});
		}

		const publicId = await this.imageStorage.uploadAvatar(command.fileBuffer, `user_${user.id}`);

		user.updateProfile(undefined, publicId);

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
