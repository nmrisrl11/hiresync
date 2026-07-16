import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { DomainEvent } from "@/shared/domain/events/domain-event.base";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class NestjsEventDispatcherAdapter implements DomainEventDispatcherPort {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	public async dispatch(event: DomainEvent): Promise<void> {
		//! Uses the class name (e.g., "UserRegisteredDomainEvent") as the routing key
		await this.eventEmitter.emitAsync(event.constructor.name, event);
	}

	public async dispatchMultiple(events: DomainEvent[]): Promise<void> {
		for (const event of events) {
			await this.dispatch(event);
		}
	}
}
