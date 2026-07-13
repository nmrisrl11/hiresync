import { UserResult } from "./get-users.in-port";

export class GetUserByIdQuery {
	constructor(public readonly userId: string) {}
}

export abstract class GetUserByIdUseCasePort {
	abstract execute(query: GetUserByIdQuery): Promise<UserResult>;
}
