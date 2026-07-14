export class GetRolesQuery {}

export type RoleResult = {
	id: string;
	code: string;
	description: string | null;
};

export abstract class GetRolesUseCasePort {
	abstract execute(query?: GetRolesQuery): Promise<RoleResult[]>;
}
