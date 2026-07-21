import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export class EmployerProfileUpdatedDomainEvent extends DomainEvent {
	constructor(
		public readonly employerId: string,
		public readonly companyName: string,
	) {
		super();
	}
}
