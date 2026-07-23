import {
	CreateEmployerProfileCommand,
	CreateEmployerProfileUseCasePort,
	EditEmployerProfileCommand,
	EditEmployerProfileUseCasePort,
	GetEmployerProfileQuery,
	GetEmployerProfileUseCasePort,
	RemoveCompanyLogoCommand,
	RemoveCompanyLogoUseCasePort,
	UploadCompanyLogoCommand,
	UploadCompanyLogoUseCasePort,
} from "@/recruitment/application/ports/inbound/employers";
import {
	CloseJobListingCommand,
	CloseJobListingUseCasePort,
	CreateJobListingCommand,
	CreateJobListingUseCasePort,
	EditJobListingCommand,
	EditJobListingUseCasePort,
	GetEmployerJobsQuery,
	GetEmployerJobsUseCasePort,
} from "@/recruitment/application/ports/inbound/jobs";
import { type JwtPayload } from "@/shared/application/types";
import { ROLES } from "@/shared/domain/types/role.type";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { Roles } from "@/shared/presentation/decorators/roles.decorator";
import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Patch,
	Post,
	Put,
	Query,
	UploadedFile,
	UseFilters,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
	CloseJobListingDto,
	CreateEmployerProfileDto,
	CreateJobListingDto,
	EditEmployerProfileDto,
	EditJobListingDto,
	GetEmployerJobsDto,
} from "../dtos";
import { RecruitmentExceptionFilter } from "../filters/recruitment-exception.filter";
import { RecruitmentResponseMapper } from "../mappers/recruitment-response.mapper";

@UseFilters(RecruitmentExceptionFilter)
@ApiTags("Employers")
@ApiBearerAuth()
@Roles(ROLES.EMPLOYER)
@Controller("employers")
export class EmployerController {
	constructor(
		private readonly createEmployerProfileUseCase: CreateEmployerProfileUseCasePort,
		private readonly getEmployerProfileUseCase: GetEmployerProfileUseCasePort,
		private readonly editEmployerProfileUseCase: EditEmployerProfileUseCasePort,
		private readonly uploadCompanyLogoUseCase: UploadCompanyLogoUseCasePort,
		private readonly removeCompanyLogoUseCase: RemoveCompanyLogoUseCasePort,
		private readonly createJobListingUseCase: CreateJobListingUseCasePort,
		private readonly editJobListingUseCase: EditJobListingUseCasePort,
		private readonly closeJobListingUseCase: CloseJobListingUseCasePort,
		private readonly getEmployerJobsUseCase: GetEmployerJobsUseCasePort,
	) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get the employer's company profile." })
	public async getProfile(@CurrentUser() user: JwtPayload) {
		const query = new GetEmployerProfileQuery(user.sub);

		const profile = await this.getEmployerProfileUseCase.execute(query);

		return { data: profile };
	}

	@Post("profile")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
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

	@Put("profile")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 15 } })
	@ApiOperation({ summary: "Edit the employer's company profile." })
	public async editProfile(@CurrentUser() user: JwtPayload, @Body() dto: EditEmployerProfileDto) {
		const command = new EditEmployerProfileCommand(
			user.sub,
			dto.companyName,
			dto.description,
			dto.website ?? null,
			dto.industry ?? null,
		);

		await this.editEmployerProfileUseCase.execute(command);

		return { message: "Employer profile updated successfully." };
	}

	@Post("profile/logo")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Upload or update the company profile logo." })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				file: {
					type: "string",
					format: "binary",
				},
			},
		},
	})
	@UseInterceptors(FileInterceptor("file"))
	public async uploadLogo(
		@CurrentUser() user: JwtPayload,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB limit
					new FileTypeValidator({ fileType: ".(png|jpeg|jpg|webp)" }),
				],
			}),
		)
		file: Express.Multer.File,
	) {
		const command = new UploadCompanyLogoCommand(user.sub, file.buffer, file.mimetype);

		await this.uploadCompanyLogoUseCase.execute(command);

		return { message: "Company logo uploaded successfully." };
	}

	@Delete("profile/logo")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Remove the company profile logo." })
	public async removeLogo(@CurrentUser() user: JwtPayload) {
		const command = new RemoveCompanyLogoCommand(user.sub);

		await this.removeCompanyLogoUseCase.execute(command);

		return { message: "Company logo removed successfully." };
	}

	@Post("jobs")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
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
	@Throttle({ default: { ttl: 60000, limit: 15 } })
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
	@Throttle({ default: { ttl: 60000, limit: 10 } })
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
	@Throttle({ default: { ttl: 60000, limit: 30 } })
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
