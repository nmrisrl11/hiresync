import { Injectable } from "@nestjs/common";
import { GetUserByIdQuery, GetUserByIdUseCasePort, UserResult } from "../ports/inbound";
import { IamRepositoryPort } from "../ports/outbound";
import { UserNotFoundException } from "../exceptions";

@Injectable()
export class GetUserByIdUseCase implements GetUserByIdUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(query: GetUserByIdQuery): Promise<UserResult> {
		const user = await this.iamRepository.findById(query.userId);

		if (!user) throw new UserNotFoundException();

		return {
			id: user.id,
			email: user.email.getValue(),
			name: user.name,
			role: user.role.code,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		};
	}
}
