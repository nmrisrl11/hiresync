import { DomainEvent } from "@/shared/events";

export class CompanyLogoRemovedDomainEvent extends DomainEvent {
	constructor(public readonly employerId: string) {
		super();
	}
}
