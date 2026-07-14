import { Injectable } from "@nestjs/common";
import {
	GetUsersQuery,
	GetUsersUseCasePort,
	PaginatedUserResult,
	UserResult,
} from "../../ports/inbound/users";
import { IamRepositoryPort } from "../../ports/outbound";

@Injectable()
export class GetUsersUseCase implements GetUsersUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(query: GetUsersQuery): Promise<PaginatedUserResult> {
		const [users, total] = await Promise.all([
			this.iamRepository.findAll(query.limit, query.offset),
			this.iamRepository.countAll(),
		]);

		const mappedUsers = users.map((user): UserResult => ({
			id: user.id,
			email: user.email.getValue(),
			name: user.name,
			image: user.image,
			role: user.role.code,
			isVerified: user.isVerified,
			createdAt: user.createdAt,
		}));

		return {
			items: mappedUsers,
			total,
		};
	}
}
