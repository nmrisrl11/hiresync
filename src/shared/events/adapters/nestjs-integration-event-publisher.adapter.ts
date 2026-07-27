import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { IntegrationEvent } from "../integration-event.base";
import { IntegrationEventPublisherPort } from "../ports";

@Injectable()
export class NestjsIntegrationEventPublisherAdapter implements IntegrationEventPublisherPort {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	public async publishAsync(event: IntegrationEvent): Promise<void> {
		await this.eventEmitter.emitAsync(event.constructor.name, event);
	}

	public async publishMultipleAsync(events: IntegrationEvent[]): Promise<void> {
		for (const event of events) {
			await this.publishAsync(event);
		}
	}
}
