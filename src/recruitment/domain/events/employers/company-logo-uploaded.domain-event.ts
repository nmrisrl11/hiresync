import { DomainEvent } from "@/shared/events";

export class CompanyLogoUploadedDomainEvent extends DomainEvent {
	constructor(
		public readonly employerId: string,
		public readonly logoPublicId: string,
	) {
		super();
	}
}
