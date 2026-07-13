import {
	GetPublicUserProfileQuery,
	GetPublicUserProfileUseCasePort,
} from "@/iam/application/ports/inbound";
import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags("Users")
@Controller("users")
export class UserController {
	constructor(private readonly getPublicUserProfileUseCase: GetPublicUserProfileUseCasePort) {}

	@Get(":id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a specific user's public profile" })
	public async getUserProfileById(@Param("id", ParseUUIDPipe) id: string) {
		const query = new GetPublicUserProfileQuery(id);

		return await this.getPublicUserProfileUseCase.execute(query);
	}
}
