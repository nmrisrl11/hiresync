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
	role: string;
	isVerified: boolean;
	createdAt: Date;
};

export abstract class GetUsersUseCasePort {
	abstract execute(query: GetUsersQuery): Promise<UserResult[]>;
}
