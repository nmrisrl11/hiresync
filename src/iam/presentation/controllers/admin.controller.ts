import { ROLES } from "@/shared/domain/types/role.type";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "../decorators/roles.decorator";
import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { GetUsersQuery, GetUsersUseCasePort } from "@/iam/application/ports/inbound/users";
import { GetUserByIdQuery, GetUserByIdUseCasePort } from "@/iam/application/ports/inbound/account";

@ApiBearerAuth()
@ApiTags("Admin")
@Roles(ROLES.ADMIN)
@Controller("admin")
export class AdminController {
	constructor(
		private readonly getUsersUseCase: GetUsersUseCasePort,
		private readonly getUserByIdUseCase: GetUserByIdUseCasePort,
	) {}

	@Get("users")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a paginated list of all users (admin only)" })
	@ApiQuery({ name: "limit", required: false, type: Number, description: "Default is 50" })
	@ApiQuery({ name: "offset", required: false, type: Number, description: "Default is 0" })
	public async getUsers(@Query("limit") limit?: string, @Query("offset") offset?: string) {
		//! Parse incoming strings to strict integers with safe fallbacks
		const parsedLimit = limit ? parseInt(limit, 10) : 50;
		const parsedOffset = offset ? parseInt(offset, 10) : 0;

		const query = new GetUsersQuery(parsedLimit, parsedOffset);
		const result = await this.getUsersUseCase.execute(query);

		return {
			data: result.items,
			meta: {
				limit: parsedLimit,
				offset: parsedOffset,
				count: result.items.length,
				totalRecords: result.total,
			},
		};
	}

	@Get("users/:id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a specific user by ID (admin only)" })
	public async getUserById(@Param("id", ParseUUIDPipe) id: string) {
		const query = new GetUserByIdQuery(id);

		return await this.getUserByIdUseCase.execute(query);
	}
}
