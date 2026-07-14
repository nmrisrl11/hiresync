export class UpdateAccountCommand {
	constructor(
		public readonly userId: string,
		public readonly name?: string,
		public readonly image?: string | null,
	) {}
}

export type UpdateAccountResult = {
	id: string;
	email: string;
	name: string;
	image: string | null;
	role: string;
	isVerified: boolean;
	createdAt: Date;
};

export abstract class UpdateAccountUseCasePort {
	abstract execute(command: UpdateAccountCommand): Promise<UpdateAccountResult>;
}
