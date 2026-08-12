import { DomainEvent } from "@/shared/events";

export class ApplicantProfileCreatedDomainEvent extends DomainEvent {
	constructor(
		public readonly applicantId: string,
		public readonly firstName: string,
		public readonly lastName: string,
	) {
		super();
	}
}
