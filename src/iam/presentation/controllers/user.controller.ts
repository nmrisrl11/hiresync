import {
	GetPublicUserProfileQuery,
	GetPublicUserProfileUseCasePort,
} from "@/iam/application/ports/inbound/users";
import { ApiSuccessResponse } from "@/shared/http/decorators";
import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	UseFilters,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PublicUserProfileResponseDto } from "../dtos/users";
import { IamExceptionFilter } from "../filters/iam-exception.filter";
import { PublicUserProfileResponseMapper } from "../mappers/users";

@UseFilters(IamExceptionFilter)
@ApiBearerAuth()
@ApiTags("Users")
@Controller("users")
export class UserController {
	constructor(private readonly getPublicUserProfileUseCase: GetPublicUserProfileUseCasePort) {}

	@Get(":id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a specific user's public profile" })
	@ApiSuccessResponse(
		PublicUserProfileResponseDto,
		HttpStatus.OK,
		"User public profile retrieved successfully.",
	)
	public async getUserProfileById(
		@Param("id", ParseUUIDPipe) id: string,
	): Promise<PublicUserProfileResponseDto> {
		const query = new GetPublicUserProfileQuery(id);
		const result = await this.getPublicUserProfileUseCase.execute(query);
		return PublicUserProfileResponseMapper.toDto(result);
	}
}
