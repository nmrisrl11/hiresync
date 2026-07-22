export class GetEmployerProfileByIdQuery {
	constructor(public readonly employerId: string) {}
}

export type PublicEmployerProfileResult = {
	id: string;
	companyName: string;
	description: string;
	website: string | null;
	logoUrl: string | null;
	industry: string | null;
	createdAt: Date;
};

export abstract class GetEmployerProfileByIdUseCasePort {
	abstract execute(query: GetEmployerProfileByIdQuery): Promise<PublicEmployerProfileResult>;
}
