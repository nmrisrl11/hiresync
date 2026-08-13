import { EventName } from "./event-names";

export abstract class DomainEvent {
	public abstract readonly eventName: EventName;
	public readonly occurredOn: Date;

	constructor() {
		this.occurredOn = new Date();
	}
}
