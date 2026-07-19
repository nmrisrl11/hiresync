import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class EmployerProfileCreatedDomainEvent extends DomainEvent {
	constructor(
		public readonly employerId: string,
		public readonly companyName: string,
	) {
		super();
	}
}
