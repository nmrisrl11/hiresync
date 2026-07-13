import { Injectable } from "@nestjs/common";
import {
	GetPublicUserProfileQuery,
	GetPublicUserProfileUseCasePort,
	PublicUserResult,
} from "../ports/inbound";
import { IamRepositoryPort } from "../ports/outbound";
import { UserNotFoundException } from "../exceptions";

@Injectable()
export class GetPublicUserProfileUseCase implements GetPublicUserProfileUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(query: GetPublicUserProfileQuery): Promise<PublicUserResult> {
		const user = await this.iamRepository.findById(query.userId);

		if (!user) throw new UserNotFoundException();

		return {
			id: user.id,
			name: user.name,
			image: user.image,
			role: user.role.code,
		};
	}
}
