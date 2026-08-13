import { EVENT_NAMES } from "./event-names";
import { IntegrationEvent } from "./integration-event.base";

export class UserAccountDeletingIntegrationEvent extends IntegrationEvent {
	public readonly eventName = EVENT_NAMES.USER_ACCOUNT_DELETING;

	constructor(public readonly userId: string) {
		super();
	}
}
