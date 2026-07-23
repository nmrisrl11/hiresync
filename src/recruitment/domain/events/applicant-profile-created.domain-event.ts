import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class ApplicantProfileCreatedDomainEvent extends DomainEvent {
	constructor(
		public readonly applicantId: string,
		public readonly firstName: string,
		public readonly lastName: string,
	) {
		super();
	}
}
