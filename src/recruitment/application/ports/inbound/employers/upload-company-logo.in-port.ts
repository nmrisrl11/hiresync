export class UploadCompanyLogoCommand {
	constructor(
		public readonly userId: string,
		public readonly fileBuffer: Buffer,
		public readonly mimeType: string,
	) {}
}

export abstract class UploadCompanyLogoUseCasePort {
	abstract execute(command: UploadCompanyLogoCommand): Promise<void>;
}
