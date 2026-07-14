export class RequestEmailChangeCommand {
	constructor(
		public readonly userId: string,
		public readonly newEmail: string,
	) {}
}

export type RequestEmailChangeResult = {
	changeEmailRequestEnqueued: boolean;
};

export abstract class RequestEmailChangeUseCasePort {
	abstract execute(command: RequestEmailChangeCommand): Promise<RequestEmailChangeResult>;
}
