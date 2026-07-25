import { IntegrationEvent } from "./integration-event.base";

export class UserAccountDeletingIntegrationEvent extends IntegrationEvent {
	constructor(public readonly userId: string) {
		super();
	}
}
