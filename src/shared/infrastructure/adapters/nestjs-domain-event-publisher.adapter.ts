import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
import { DomainEvent } from "@/shared/domain/events/domain-event.base";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class NestjsDomainEventPublisherAdapter implements DomainEventPublisherPort {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	public async publishAsync(event: DomainEvent): Promise<void> {
		//! Uses the class name (e.g., "UserRegisteredDomainEvent") as the routing key
		await this.eventEmitter.emitAsync(event.constructor.name, event);
	}

	public async publishMultipleAsync(events: DomainEvent[]): Promise<void> {
		for (const event of events) {
			await this.publishAsync(event);
		}
	}
}
