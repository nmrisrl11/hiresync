import { UpdateAccountResult } from "./update-account.in-port";

export class UploadAvatarCommand {
	constructor(
		public readonly userId: string,
		public readonly fileBuffer: Buffer,
		public readonly mimeType: string,
	) {}
}

export abstract class UploadAvatarUseCasePort {
	abstract execute(command: UploadAvatarCommand): Promise<UpdateAccountResult>;
}
