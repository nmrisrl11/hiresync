export class GetApplicantProfileQuery {
	constructor(public readonly userId: string) {}
}

export type ApplicantProfileResult = {
	id: string;
	userId: string;
	firstName: string;
	lastName: string;
	headline: string | null;
	bio: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export abstract class GetApplicantProfileUseCasePort {
	abstract execute(query: GetApplicantProfileQuery): Promise<ApplicantProfileResult>;
}
