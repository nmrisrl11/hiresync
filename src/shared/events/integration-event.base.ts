export abstract class IntegrationEvent {
	public readonly occurredOn: Date;

	constructor() {
		this.occurredOn = new Date();
	}
}
