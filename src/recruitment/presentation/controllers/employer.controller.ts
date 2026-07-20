import {
	CloseJobListingUseCasePort,
	CreateEmployerProfileCommand,
	CreateEmployerProfileUseCasePort,
	CreateJobListingUseCasePort,
	EditJobListingUseCasePort,
	GetEmployerJobsUseCasePort,
} from "@/recruitment/application/ports/inbound/employers";
import { type JwtPayload } from "@/shared/application/types";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateEmployerProfileDto } from "../dtos";

@ApiTags("Employers")
@ApiBearerAuth()
@Controller("employers")
export class EmployerController {
	constructor(
		private readonly createEmployerProfileUseCase: CreateEmployerProfileUseCasePort,
		private readonly createJobListingUseCase: CreateJobListingUseCasePort,
		private readonly editJobListingUseCase: EditJobListingUseCasePort,
		private readonly closeJobListingUseCase: CloseJobListingUseCasePort,
		private readonly getEmployerJobsUseCase: GetEmployerJobsUseCasePort,
	) {}

	@Post("profile")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create an employer profile." })
	public async createProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: CreateEmployerProfileDto,
	) {
		const command = new CreateEmployerProfileCommand(
			user.sub,
			dto.companyName,
			dto.description,
			dto.website,
			dto.industry,
		);

		await this.createEmployerProfileUseCase.execute(command);

		return { message: "Employer profile created successfully." };
	}
}
