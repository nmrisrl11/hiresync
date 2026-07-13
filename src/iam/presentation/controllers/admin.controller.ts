import { ROLES } from "@/shared/domain/types/role.type";
import { ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Roles } from "../decorators/roles.decorator";
import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { GetUsersQuery, GetUsersUseCasePort } from "@/iam/application/ports/inbound";

@ApiBearerAuth()
@Roles(ROLES.ADMIN)
@Controller("admin")
export class AdminController {
	constructor(private readonly getUsersUseCase: GetUsersUseCasePort) {}

	@Get("users")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a paginated list of all users (admin only)" })
	@ApiQuery({ name: "limit", required: false, type: Number, description: "Default is 50" })
	@ApiQuery({ name: "offset", required: false, type: Number, description: "Default is 0" })
	public async findAll(@Query("limit") limit?: string, @Query("offset") offset?: string) {
		// 1. Parse incoming strings to strict integers with safe fallbacks
		const parsedLimit = limit ? parseInt(limit, 10) : 50;
		const parsedOffset = offset ? parseInt(offset, 10) : 0;

		// 2. Instantiate the strict Query object
		const query = new GetUsersQuery(parsedLimit, parsedOffset);

		// 3. Execute the Use Case
		const users = await this.getUsersUseCase.execute(query);

		// 4. Return a standardized paginated response structure
		return {
			data: users,
			meta: {
				limit: parsedLimit,
				offset: parsedOffset,
				count: users.length,
			},
		};
	}
}
