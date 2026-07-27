import { IntegrationEvent } from "../integration-event.base";

export abstract class IntegrationEventPublisherPort {
	abstract publishAsync(event: IntegrationEvent): Promise<void>;
	abstract publishMultipleAsync(events: IntegrationEvent[]): Promise<void>;
}
