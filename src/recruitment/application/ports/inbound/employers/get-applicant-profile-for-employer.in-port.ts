export class GetApplicantProfileForEmployerQuery {
	constructor(
		public readonly employerUserId: string,
		public readonly applicantId: string,
	) {}
}

export type ApplicantProfileResult = {
	id: string;
	firstName: string;
	lastName: string;
	headline: string | null;
	bio: string | null;
	userId: string;
};

export abstract class GetApplicantProfileForEmployerUseCasePort {
	abstract execute(query: GetApplicantProfileForEmployerQuery): Promise<ApplicantProfileResult>;
}
