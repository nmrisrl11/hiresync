import { Injectable } from "@nestjs/common";
import { GetUsersQuery, GetUsersUseCasePort, UserResult } from "../ports/inbound";
import { IamRepositoryPort } from "../ports/outbound";

@Injectable()
export class GetUsersUseCase implements GetUsersUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(query: GetUsersQuery): Promise<UserResult[]> {
		const users = await this.iamRepository.findAll(query.limit, query.offset);

		return users.map((user) => ({
			id: user.id,
			email: user.email.getValue(),
			name: user.name,
			role: user.role.code,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		}));
	}
}
