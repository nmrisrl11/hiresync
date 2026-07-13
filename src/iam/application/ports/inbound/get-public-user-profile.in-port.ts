export class GetPublicUserProfileQuery {
	constructor(public readonly userId: string) {}
}

export type PublicUserResult = {
	id: string;
	name: string;
	image: string | null;
	role: string;
};

export abstract class GetPublicUserProfileUseCasePort {
	abstract execute(query: GetPublicUserProfileQuery): Promise<PublicUserResult>;
}
