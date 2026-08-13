import { EventName } from "./event-names";

export abstract class IntegrationEvent {
	public abstract readonly eventName: EventName;
	public readonly occurredOn: Date;

	constructor() {
		this.occurredOn = new Date();
	}
}
