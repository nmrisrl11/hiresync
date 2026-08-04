import {
	DeleteAccountCommand,
	DeleteAccountUseCasePort,
	GetUserByIdQuery,
	GetUserByIdUseCasePort,
} from "@/iam/application/ports/inbound/account";
import { GetUsersQuery, GetUsersUseCasePort } from "@/iam/application/ports/inbound/users";
import { ApiMessageResponse, ApiSuccessResponse, Roles } from "@/shared/http/decorators";
import { PaginationDto } from "@/shared/http/dtos";
import { ROLES } from "@/shared/types";
import {
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminUserResponseDto, PaginatedUsersResponseDto } from "../dtos/admin";
import { AdminUserResponseMapper, PaginatedUsersResponseMapper } from "../mappers/admin";

@ApiBearerAuth()
@ApiTags("Admin")
@Roles(ROLES.ADMIN)
@Controller("admin")
export class AdminController {
	constructor(
		private readonly getUsersUseCase: GetUsersUseCasePort,
		private readonly getUserByIdUseCase: GetUserByIdUseCasePort,
		private readonly deleteAccountUseCase: DeleteAccountUseCasePort,
	) {}

	@Get("users")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a paginated list of all users (admin only)" })
	@ApiSuccessResponse(PaginatedUsersResponseDto, HttpStatus.OK, "Users retrieved successfully.")
	public async getUsers(@Query() queryDto: PaginationDto): Promise<PaginatedUsersResponseDto> {
		const query = new GetUsersQuery(queryDto.limit, queryDto.offset);
		const result = await this.getUsersUseCase.execute(query);
		return PaginatedUsersResponseMapper.toDto(result, queryDto.limit, queryDto.offset);
	}

	@Get("users/:id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a specific user by ID (admin only)" })
	@ApiSuccessResponse(AdminUserResponseDto, HttpStatus.OK, "User retrieved successfully.")
	public async getUserById(@Param("id", ParseUUIDPipe) id: string): Promise<AdminUserResponseDto> {
		const query = new GetUserByIdQuery(id);
		const result = await this.getUserByIdUseCase.execute(query);
		return AdminUserResponseMapper.toDto(result);
	}

	@Delete("users/:id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Delete a user account instantly and permanently (admin only)" })
	@ApiMessageResponse(HttpStatus.OK, "User account permanently deleted.")
	public async forceDeleteUser(@Param("id", ParseUUIDPipe) id: string) {
		const command = new DeleteAccountCommand(id);
		await this.deleteAccountUseCase.execute(command);
		return { message: "User account permanently deleted." };
	}
}
