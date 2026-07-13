export class RefreshTokenCommand {
	constructor(public readonly token: string) {}
}

export type RefreshTokenResult = {
	accessToken: string;
	refreshToken: string;
};

export abstract class RefreshTokenUseCasePort {
	abstract execute(command: RefreshTokenCommand): Promise<RefreshTokenResult>;
}
