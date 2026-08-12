import { UserRepository } from "@/iam/domain/repositories";
import { UserId } from "@/iam/domain/value-objects";
import { DomainEventPublisherPort } from "@/shared/events/ports";
import { Injectable } from "@nestjs/common";
import { UserNotFoundException } from "../../exceptions";
import {
	UpdateAccountResult,
	UploadAvatarCommand,
	UploadAvatarUseCasePort,
} from "../../ports/inbound/account";
import { ImageStoragePort } from "../../ports/outbound";

@Injectable()
export class UploadAvatarUseCase implements UploadAvatarUseCasePort {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly imageStorage: ImageStoragePort,
		private readonly domainEventPublisher: DomainEventPublisherPort,
	) {}

	public async execute(command: UploadAvatarCommand): Promise<UpdateAccountResult> {
		const userIdVo = new UserId(command.userId);
		const user = await this.userRepository.findById(userIdVo);
		if (!user) throw new UserNotFoundException();

		//! For now if the user already has an image, delete the old one from Cloudinary to save space
		if (user.image) {
			await this.imageStorage.deleteImage(user.image).catch(() => {
				//! Silently fail if the old image wasn't found in Cloudinary
			});
		}

		const publicId = await this.imageStorage.uploadAvatar(
			command.fileBuffer,
			`user_${user.id.getValue()}`,
		);

		user.updateProfile(undefined, publicId);

		await this.userRepository.save(user);

		await this.domainEventPublisher.publishMultipleAsync(user.domainEvents);
		user.clearEvents();

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
