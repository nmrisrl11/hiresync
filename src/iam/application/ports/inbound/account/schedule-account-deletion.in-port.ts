export class ScheduleAccountDeletionCommand {
	constructor(public readonly userId: string) {}
}

export abstract class ScheduleAccountDeletionUseCasePort {
	abstract execute(command: ScheduleAccountDeletionCommand): Promise<void>;
}
