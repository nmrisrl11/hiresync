export class GetEmployerProfileQuery {
	constructor(public readonly userId: string) {}
}

export type GetEmployerProfileResult = {
	id: string;
	companyName: string;
	description: string;
	website: string | null;
	logoUrl: string | null;
	industry: string | null;
};

export abstract class GetEmployerProfileUseCasePort {
	abstract execute(query: GetEmployerProfileQuery): Promise<GetEmployerProfileResult>;
}
