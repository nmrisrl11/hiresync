import { UserRepository } from "@/iam/domain/repositories";
import { Injectable } from "@nestjs/common";
import {
	GetUsersQuery,
	GetUsersUseCasePort,
	PaginatedUserResult,
	UserResult,
} from "../../ports/inbound/users";

@Injectable()
export class GetUsersUseCase implements GetUsersUseCasePort {
	constructor(private readonly userRepository: UserRepository) {}

	public async execute(query: GetUsersQuery): Promise<PaginatedUserResult> {
		const [users, total] = await Promise.all([
			this.userRepository.findAll(query.limit, query.offset),
			this.userRepository.countAll(),
		]);

		const mappedUsers = users.map((user): UserResult => ({
			id: user.id.getValue(),
			email: user.email.getValue(),
			name: user.name,
			image: user.image,
			role: user.role.code.getValue(),
			isVerified: user.isVerified,
			hasPassword: user.account?.hasPassword() ?? false,
			createdAt: user.createdAt,
		}));

		return {
			items: mappedUsers,
			total,
		};
	}
}
