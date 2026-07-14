export class GetUsersQuery {
	constructor(
		public readonly limit: number = 50,
		public readonly offset: number = 0,
	) {}
}

export type UserResult = {
	id: string;
	email: string;
	name: string;
	image: string | null;
	role: string;
	isVerified: boolean;
	createdAt: Date;
};

export type PaginatedUserResult = {
	items: UserResult[];
	total: number;
};

export abstract class GetUsersUseCasePort {
	abstract execute(query: GetUsersQuery): Promise<PaginatedUserResult>;
}
