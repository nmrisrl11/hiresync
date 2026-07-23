import {
	CreateApplicantProfileCommand,
	CreateApplicantProfileUseCasePort,
	EditApplicantProfileCommand,
	EditApplicantProfileUseCasePort,
	GetApplicantProfileQuery,
	GetApplicantProfileUseCasePort,
} from "@/recruitment/application/ports/inbound/applicants";
import { type JwtPayload } from "@/shared/application/types";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseFilters } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CreateApplicantProfileDto, EditApplicantProfileDto } from "../dtos";
import { RecruitmentExceptionFilter } from "../filters/recruitment-exception.filter";

@UseFilters(RecruitmentExceptionFilter)
@ApiTags("Applicants")
@ApiBearerAuth()
@Controller("applicants")
export class ApplicantController {
	constructor(
		private readonly createApplicantProfileUseCase: CreateApplicantProfileUseCasePort,
		private readonly editApplicantProfileUseCase: EditApplicantProfileUseCasePort,
		private readonly getApplicantProfileUseCase: GetApplicantProfileUseCasePort,
	) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get the applicant's profile." })
	public async getProfile(@CurrentUser() user: JwtPayload) {
		const query = new GetApplicantProfileQuery(user.sub);
		const profile = await this.getApplicantProfileUseCase.execute(query);

		return { data: profile };
	}

	@Post("profile")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Create an applicant profile." })
	public async createProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: CreateApplicantProfileDto,
	) {
		const command = new CreateApplicantProfileCommand(
			user.sub,
			dto.firstName,
			dto.lastName,
			dto.headline,
			dto.bio,
		);

		await this.createApplicantProfileUseCase.execute(command);

		return { message: "Applicant profile created successfully." };
	}

	@Put("profile")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 15 } })
	@ApiOperation({ summary: "Edit the applicant profile." })
	public async editProfile(@CurrentUser() user: JwtPayload, @Body() dto: EditApplicantProfileDto) {
		const command = new EditApplicantProfileCommand(
			user.sub,
			dto.firstName,
			dto.lastName,
			dto.headline,
			dto.bio,
		);

		await this.editApplicantProfileUseCase.execute(command);

		return { message: "Applicant profile updated successfully." };
	}
}
