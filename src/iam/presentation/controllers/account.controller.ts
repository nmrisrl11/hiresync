import { GetUserByIdQuery, GetUserByIdUseCasePort } from "@/iam/application/ports/inbound";
import { type JwtPayload } from "@/iam/application/ports/outbound";
import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../decorators/current-user.decorator";

@ApiBearerAuth()
@ApiTags("Accounts")
@Controller("accounts")
export class AccountController {
	constructor(private readonly getUserByIdUseCase: GetUserByIdUseCasePort) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get current authenticated user profile" })
	public async getProfile(@CurrentUser() userPayload: JwtPayload) {
		const query = new GetUserByIdQuery(userPayload.sub);

		return await this.getUserByIdUseCase.execute(query);
	}
}
