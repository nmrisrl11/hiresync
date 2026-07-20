import { GetRolesUseCasePort } from "@/iam/application/ports/inbound/roles";
import { ROLES } from "@/shared/domain/types/role.type";
import { Roles } from "@/shared/presentation/decorators/roles.decorator";
import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("Roles")
@Roles(ROLES.ADMIN)
@Controller("roles")
export class RoleController {
	constructor(private readonly getRolesUseCase: GetRolesUseCasePort) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a list of all system roles (admin only)" })
	public async getAllRoles() {
		const roles = await this.getRolesUseCase.execute();

		return {
			data: roles,
			meta: {
				count: roles.length,
			},
		};
	}
}
