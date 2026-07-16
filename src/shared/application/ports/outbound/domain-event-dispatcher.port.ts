import { DomainEvent } from "@/shared/domain/events/domain-event.base";

export abstract class DomainEventDispatcherPort {
	abstract dispatch(event: DomainEvent): Promise<void>;
	abstract dispatchMultiple(events: DomainEvent[]): Promise<void>;
}
