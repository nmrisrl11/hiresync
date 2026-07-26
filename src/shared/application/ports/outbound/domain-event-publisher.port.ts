import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export abstract class DomainEventPublisherPort {
	abstract publishAsync(event: DomainEvent): Promise<void>;
	abstract publishMultipleAsync(events: DomainEvent[]): Promise<void>;
}
