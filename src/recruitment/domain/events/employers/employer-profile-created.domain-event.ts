import { DomainEvent } from "@/shared/events";

export class EmployerProfileCreatedDomainEvent extends DomainEvent {
	constructor(
		public readonly employerId: string,
		public readonly companyName: string,
	) {
		super();
	}
}
