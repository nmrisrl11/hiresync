import { IntegrationEvent } from "@/shared/infrastructure/events/integration";

export abstract class IntegrationEventPublisherPort {
	abstract publishAsync(event: IntegrationEvent): Promise<void>;
	abstract publishMultipleAsync(events: IntegrationEvent[]): Promise<void>;
}
