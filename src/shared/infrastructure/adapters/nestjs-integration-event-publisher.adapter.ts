import { IntegrationEventPublisherPort } from "@/shared/application/ports/outbound";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { IntegrationEvent } from "../events/integration";

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
