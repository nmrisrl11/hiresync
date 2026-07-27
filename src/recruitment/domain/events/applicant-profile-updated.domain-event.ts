import { DomainEvent } from "@/shared/events";

export class ApplicantProfileUpdatedDomainEvent extends DomainEvent {
	constructor(public readonly applicantId: string) {
		super();
	}
}
