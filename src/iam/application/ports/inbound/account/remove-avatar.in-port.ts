import { UpdateAccountResult } from "./update-account.in-port";

export class RemoveAvatarCommand {
	constructor(public readonly userId: string) {}
}

export abstract class RemoveAvatarUseCasePort {
	abstract execute(command: RemoveAvatarCommand): Promise<UpdateAccountResult>;
}
