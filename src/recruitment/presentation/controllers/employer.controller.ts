import {
	CloseJobListingCommand,
	CloseJobListingUseCasePort,
	CreateEmployerProfileCommand,
	CreateEmployerProfileUseCasePort,
	CreateJobListingCommand,
	CreateJobListingUseCasePort,
	EditJobListingCommand,
	EditJobListingUseCasePort,
	GetEmployerJobsQuery,
	GetEmployerJobsUseCasePort,
	GetEmployerProfileQuery,
	GetEmployerProfileUseCasePort,
} from "@/recruitment/application/ports/inbound/employers";
import { type JwtPayload } from "@/shared/application/types";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Put,
	Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	CloseJobListingDto,
	CreateEmployerProfileDto,
	CreateJobListingDto,
	EditJobListingDto,
	GetEmployerJobsDto,
} from "../dtos";
import { RecruitmentResponseMapper } from "../mappers/recruitment-response.mapper";

@ApiTags("Employers")
@ApiBearerAuth()
@Controller("employers")
export class EmployerController {
	constructor(
		private readonly createEmployerProfileUseCase: CreateEmployerProfileUseCasePort,
		private readonly getEmployerProfileUseCase: GetEmployerProfileUseCasePort,
		private readonly createJobListingUseCase: CreateJobListingUseCasePort,
		private readonly editJobListingUseCase: EditJobListingUseCasePort,
		private readonly closeJobListingUseCase: CloseJobListingUseCasePort,
		private readonly getEmployerJobsUseCase: GetEmployerJobsUseCasePort,
	) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get the employer's company profile." })
	public async getProfile(@CurrentUser() user: JwtPayload) {
		const query = new GetEmployerProfileQuery(user.sub);

		const profile = await this.getEmployerProfileUseCase.execute(query);

		return { data: profile };
	}

	@Post("profile")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create an employer's company profile." })
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

	@Post("jobs")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create a new job listing." })
	public async createJob(@CurrentUser() user: JwtPayload, @Body() dto: CreateJobListingDto) {
		const command = new CreateJobListingCommand(
			user.sub,
			dto.title,
			dto.description,
			dto.requirements,
			dto.employmentType,
			dto.locationType,
			dto.locationAddress ?? null,
			dto.salaryMin ?? null,
			dto.salaryMax ?? null,
			dto.salaryCurrency,
			dto.expiresAt,
		);

		const jobId = await this.createJobListingUseCase.execute(command);

		return { message: "Job listing created successfully.", jobId };
	}

	@Put("jobs/:id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Edit an existing job listing." })
	public async editJob(
		@CurrentUser() user: JwtPayload,
		@Param("id") jobId: string,
		@Body() dto: EditJobListingDto,
	) {
		const command = new EditJobListingCommand(
			user.sub,
			jobId,
			dto.title,
			dto.description,
			dto.requirements,
			dto.employmentType,
			dto.locationType,
			dto.locationAddress ?? null,
			dto.salaryMin ?? null,
			dto.salaryMax ?? null,
			dto.salaryCurrency,
		);

		await this.editJobListingUseCase.execute(command);

		return { message: "Job listing updated successfully." };
	}

	@Patch("jobs/:id/close")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Close a job listing." })
	public async closeJob(
		@CurrentUser() user: JwtPayload,
		@Param("id") jobId: string,
		@Body() dto: CloseJobListingDto,
	) {
		const command = new CloseJobListingCommand(user.sub, jobId, dto.reason);

		await this.closeJobListingUseCase.execute(command);

		return { message: "Job listing closed successfully." };
	}

	@Get("jobs")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get a paginated list of jobs posted by the employer." })
	public async getJobs(@CurrentUser() user: JwtPayload, @Query() queryDto: GetEmployerJobsDto) {
		const query = new GetEmployerJobsQuery(
			user.sub,
			queryDto.limit,
			queryDto.offset,
			queryDto.status,
		);

		const { items, total } = await this.getEmployerJobsUseCase.execute(query);

		return {
			data: items.map((job) => RecruitmentResponseMapper.toJobListingResponse(job)),
			meta: {
				total,
				limit: queryDto.limit,
				offset: queryDto.offset,
			},
		};
	}
}
