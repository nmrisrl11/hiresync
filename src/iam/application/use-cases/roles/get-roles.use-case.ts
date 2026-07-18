import { RoleRepository } from "@/iam/domain/repositories";
import { Injectable } from "@nestjs/common";
import { GetRolesUseCasePort, RoleResult } from "../../ports/inbound/roles/get-roles.in-port";

@Injectable()
export class GetRolesUseCase implements GetRolesUseCasePort {
	constructor(private readonly roleRepository: RoleRepository) {}

	public async execute(): Promise<RoleResult[]> {
		const roles = await this.roleRepository.findAll();

		return roles.map((role): RoleResult => ({
			id: role.id.getValue(),
			code: role.code.getValue(),
			description: role.description,
		}));
	}
}
