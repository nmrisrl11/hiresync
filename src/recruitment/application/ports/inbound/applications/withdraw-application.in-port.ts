export class WithdrawApplicationCommand {
	constructor(
		public readonly userId: string,
		public readonly applicationId: string,
	) {}
}

export abstract class WithdrawApplicationUseCasePort {
	abstract execute(command: WithdrawApplicationCommand): Promise<void>;
}
