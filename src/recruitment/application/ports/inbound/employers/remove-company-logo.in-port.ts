export class RemoveCompanyLogoCommand {
	constructor(public readonly userId: string) {}
}

export abstract class RemoveCompanyLogoUseCasePort {
	abstract execute(command: RemoveCompanyLogoCommand): Promise<void>;
}
