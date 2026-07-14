import { Injectable } from "@nestjs/common";
import { GetRolesUseCasePort, RoleResult } from "../../ports/inbound/roles/get-roles.in-port";
import { IamRepositoryPort } from "../../ports/outbound";

@Injectable()
export class GetRolesUseCase implements GetRolesUseCasePort {
	constructor(private readonly iamRepository: IamRepositoryPort) {}

	public async execute(): Promise<RoleResult[]> {
		const roles = await this.iamRepository.findAllRoles();

		return roles.map((role): RoleResult => ({
			id: role.id,
			code: role.code,
			description: role.description,
		}));
	}
}
