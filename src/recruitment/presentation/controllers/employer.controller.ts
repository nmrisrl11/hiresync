import {
	BulkUpdateApplicationStatusCommand,
	BulkUpdateApplicationStatusUseCasePort,
	GetEmployerApplicationsQuery,
	GetEmployerApplicationsUseCasePort,
	UpdateApplicationStatusCommand,
	UpdateApplicationStatusUseCasePort,
	UpdateInternalNoteCommand,
	UpdateInternalNoteUseCasePort,
} from "@/recruitment/application/ports/inbound/applications";
import {
	CreateEmployerProfileCommand,
	CreateEmployerProfileUseCasePort,
	EditEmployerProfileCommand,
	EditEmployerProfileUseCasePort,
	GetApplicantProfileForEmployerQuery,
	GetApplicantProfileForEmployerUseCasePort,
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
import { CurrentUser, Roles } from "@/shared/http/decorators";
import { ROLES, type JwtPayload } from "@/shared/types";
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
	BulkUpdateApplicationStatusRequestDto,
	GetApplicationsRequestDto,
	UpdateApplicationStatusRequestDto,
	UpdateInternalNoteRequestDto,
} from "../dtos/applications";
import { CreateEmployerProfileRequestDto, EditEmployerProfileRequestDto } from "../dtos/employers";
import {
	CloseJobListingRequestDto,
	CreateJobListingRequestDto,
	EditJobListingRequestDto,
	GetEmployerJobsRequestDto,
} from "../dtos/jobs";
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
		private readonly getEmployerApplicationsUseCase: GetEmployerApplicationsUseCasePort,
		private readonly updateApplicationStatusUseCase: UpdateApplicationStatusUseCasePort,
		private readonly getApplicantProfileForEmployerUseCase: GetApplicantProfileForEmployerUseCasePort,
		private readonly bulkUpdateApplicationStatusUseCase: BulkUpdateApplicationStatusUseCasePort,
		private readonly updateInternalNoteUseCase: UpdateInternalNoteUseCasePort,
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
		@Body() dto: CreateEmployerProfileRequestDto,
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
	public async editProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: EditEmployerProfileRequestDto,
	) {
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
	public async createJob(@CurrentUser() user: JwtPayload, @Body() dto: CreateJobListingRequestDto) {
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
		@Body() dto: EditJobListingRequestDto,
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
		@Body() dto: CloseJobListingRequestDto,
	) {
		const command = new CloseJobListingCommand(user.sub, jobId, dto.reason);

		await this.closeJobListingUseCase.execute(command);

		return { message: "Job listing closed successfully." };
	}

	@Get("jobs")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a paginated list of jobs posted by the employer." })
	public async getJobs(
		@CurrentUser() user: JwtPayload,
		@Query() queryDto: GetEmployerJobsRequestDto,
	) {
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

	@Get("applications")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a paginated list of applications received for your jobs." })
	public async getApplications(
		@CurrentUser() user: JwtPayload,
		@Query() queryDto: GetApplicationsRequestDto,
	) {
		const query = new GetEmployerApplicationsQuery(
			user.sub,
			queryDto.limit,
			queryDto.offset,
			queryDto.jobListingId,
			queryDto.status,
		);

		const { items, total } = await this.getEmployerApplicationsUseCase.execute(query);

		return {
			data: items,
			meta: { total, limit: queryDto.limit, offset: queryDto.offset },
		};
	}

	@Patch("applications/:id/status")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 15 } })
	@ApiOperation({ summary: "Update the status of a specific job application." })
	public async updateApplicationStatus(
		@CurrentUser() user: JwtPayload,
		@Param("id") applicationId: string,
		@Body() dto: UpdateApplicationStatusRequestDto,
	) {
		const command = new UpdateApplicationStatusCommand(user.sub, applicationId, dto.newStatus);

		await this.updateApplicationStatusUseCase.execute(command);

		return { message: "Application status updated successfully." };
	}

	@Patch("applications/bulk-status")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Bulk update the status of multiple applications." })
	public async bulkUpdateApplicationStatus(
		@CurrentUser() user: JwtPayload,
		@Body() dto: BulkUpdateApplicationStatusRequestDto,
	) {
		const command = new BulkUpdateApplicationStatusCommand(
			user.sub,
			dto.applicationIds,
			dto.newStatus,
		);

		await this.bulkUpdateApplicationStatusUseCase.execute(command);

		return { message: "Applications successfully updated." };
	}

	@Patch("applications/:id/note")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 15 } })
	@ApiOperation({ summary: "Update the internal note for an application." })
	public async updateApplicationNote(
		@CurrentUser() user: JwtPayload,
		@Param("id") applicationId: string,
		@Body() dto: UpdateInternalNoteRequestDto,
	) {
		const command = new UpdateInternalNoteCommand(user.sub, applicationId, dto.note ?? null);

		await this.updateInternalNoteUseCase.execute(command);

		return { message: "Internal note successfully updated." };
	}

	@Get("applicants/:id")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({
		summary: "Get an applicant's profile (restricted to applicants who applied to your jobs).",
	})
	public async getApplicantProfile(
		@CurrentUser() user: JwtPayload,
		@Param("id") applicantId: string,
	) {
		const query = new GetApplicantProfileForEmployerQuery(user.sub, applicantId);
		const profile = await this.getApplicantProfileForEmployerUseCase.execute(query);

		return { data: profile };
	}
}
