import { RoleResult } from "@/iam/application/ports/inbound/roles";
import { AdminRolesListResponseDto } from "../../dtos/admin";

export class AdminRolesResponseMapper {
	public static toDto(roles: RoleResult[]): AdminRolesListResponseDto {
		return {
			data: roles.map((role) => ({
				id: role.id,
				code: role.code,
				description: role.description,
			})),
			meta: {
				count: roles.length,
			},
		};
	}
}
