import {
	CreateApplicantProfileCommand,
	CreateApplicantProfileUseCasePort,
	EditApplicantProfileCommand,
	EditApplicantProfileUseCasePort,
	GetApplicantProfileQuery,
	GetApplicantProfileUseCasePort,
	GetSavedJobsQuery,
	GetSavedJobsUseCasePort,
	ToggleSavedJobCommand,
	ToggleSavedJobUseCasePort,
} from "@/recruitment/application/ports/inbound/applicants";
import {
	ApplyForJobCommand,
	ApplyForJobUseCasePort,
	GetApplicantApplicationsQuery,
	GetApplicantApplicationsUseCasePort,
	WithdrawApplicationCommand,
	WithdrawApplicationUseCasePort,
} from "@/recruitment/application/ports/inbound/applications";
import {
	ApiMessageResponse,
	ApiSuccessResponse,
	CurrentUser,
	Roles,
} from "@/shared/http/decorators";
import { PaginationDto } from "@/shared/http/dtos";
import { ROLES, type JwtPayload } from "@/shared/types";
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
	UploadedFiles,
	UseFilters,
	UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
	ApplicantProfileResponseDto,
	CreateApplicantProfileRequestDto,
	EditApplicantProfileRequestDto,
	PaginatedSavedJobsResponseDto,
	ToggleSavedJobResponseDto,
} from "../dtos/applicants";
import {
	ApplyForJobRequestDto,
	ApplyForJobResponseDto,
	GetApplicationsRequestDto,
	PaginatedApplicantApplicationsResponseDto,
} from "../dtos/applications";
import { RecruitmentExceptionFilter } from "../filters/recruitment-exception.filter";
import { DocumentValidationPipe } from "../pipes/document-validation.pipe";
import {
	ApplicantProfileResponseMapper,
	PaginatedSavedJobsResponseMapper,
	ToggleSavedJobResponseMapper,
} from "../mappers/applicants";
import {
	ApplyForJobResponseMapper,
	PaginatedApplicantApplicationsResponseMapper,
} from "../mappers/applications";

@UseFilters(RecruitmentExceptionFilter)
@ApiTags("Applicants")
@ApiBearerAuth()
@Roles(ROLES.APPLICANT)
@Controller("applicants")
export class ApplicantController {
	constructor(
		private readonly createApplicantProfileUseCase: CreateApplicantProfileUseCasePort,
		private readonly editApplicantProfileUseCase: EditApplicantProfileUseCasePort,
		private readonly getApplicantProfileUseCase: GetApplicantProfileUseCasePort,
		private readonly applyForJobUseCase: ApplyForJobUseCasePort,
		private readonly getApplicantApplicationsUseCase: GetApplicantApplicationsUseCasePort,
		private readonly withdrawApplicationUseCase: WithdrawApplicationUseCasePort,
		private readonly toggleSavedJobUseCase: ToggleSavedJobUseCasePort,
		private readonly getSavedJobsUseCase: GetSavedJobsUseCasePort,
	) {}

	@Get("profile")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get the applicant's profile." })
	@ApiSuccessResponse(
		ApplicantProfileResponseDto,
		HttpStatus.OK,
		"Applicant profile retrieved successfully.",
	)
	public async getProfile(@CurrentUser() user: JwtPayload): Promise<ApplicantProfileResponseDto> {
		const query = new GetApplicantProfileQuery(user.sub);
		const profile = await this.getApplicantProfileUseCase.execute(query);
		return ApplicantProfileResponseMapper.toDto(profile);
	}

	@Post("profile")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Create an applicant profile." })
	@ApiMessageResponse(HttpStatus.CREATED, "Applicant profile created successfully.")
	public async createProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: CreateApplicantProfileRequestDto,
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
	@ApiMessageResponse(HttpStatus.OK, "Applicant profile updated successfully.")
	public async editProfile(
		@CurrentUser() user: JwtPayload,
		@Body() dto: EditApplicantProfileRequestDto,
	) {
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

	@Post("applications")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({
		summary: "Apply for a job listing with a PDF resume and an optional TXT cover letter.",
	})
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["jobListingId", "resume"],
			properties: {
				jobListingId: {
					type: "string",
					format: "uuid",
					description: "The ID of the job listing being applied for",
				},
				resume: {
					type: "string",
					format: "binary",
					description: "PDF Resume (Max 5MB)",
				},
				coverLetter: {
					type: "string",
					format: "binary",
					description: "Optional TXT Cover Letter (Max 5MB)",
				},
			},
		},
	})
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: "resume", maxCount: 1 },
			{ name: "coverLetter", maxCount: 1 },
		]),
	)
	@ApiSuccessResponse(
		ApplyForJobResponseDto,
		HttpStatus.CREATED,
		"Application submitted successfully.",
	)
	public async applyForJob(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ApplyForJobRequestDto,
		@UploadedFiles(DocumentValidationPipe)
		files: {
			resume: Express.Multer.File[];
			coverLetter?: Express.Multer.File[];
		},
	) {
		const command = new ApplyForJobCommand(
			user.sub,
			dto.jobListingId,
			files.resume[0].buffer,
			files.coverLetter?.[0]?.buffer,
		);

		const applicationId = await this.applyForJobUseCase.execute(command);

		return ApplyForJobResponseMapper.toDto(applicationId);
	}

	@Get("applications")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a paginated list of your submitted applications." })
	@ApiSuccessResponse(
		PaginatedApplicantApplicationsResponseDto,
		HttpStatus.OK,
		"Applications retrieved successfully.",
	)
	public async getApplications(
		@CurrentUser() user: JwtPayload,
		@Query() queryDto: GetApplicationsRequestDto,
	): Promise<PaginatedApplicantApplicationsResponseDto> {
		const query = new GetApplicantApplicationsQuery(
			user.sub,
			queryDto.limit,
			queryDto.offset,
			queryDto.status,
		);

		const result = await this.getApplicantApplicationsUseCase.execute(query);

		return PaginatedApplicantApplicationsResponseMapper.toDto(
			result,
			queryDto.limit,
			queryDto.offset,
		);
	}

	@Patch("applications/:id/withdraw")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 15 } })
	@ApiOperation({ summary: "Withdraw a pending job application." })
	@ApiMessageResponse(HttpStatus.OK, "Application withdrawn successfully.")
	public async withdrawApplication(
		@CurrentUser() user: JwtPayload,
		@Param("id") applicationId: string,
	) {
		const command = new WithdrawApplicationCommand(user.sub, applicationId);

		await this.withdrawApplicationUseCase.execute(command);

		return { message: "Application withdrawn successfully." };
	}

	@Post("saved-jobs/:jobListingId/toggle")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Bookmark or un-bookmark a job listing." })
	@ApiSuccessResponse(ToggleSavedJobResponseDto, HttpStatus.OK, "Job saved status toggled.")
	public async toggleSavedJob(
		@CurrentUser() user: JwtPayload,
		@Param("jobListingId") jobListingId: string,
	): Promise<ToggleSavedJobResponseDto> {
		const command = new ToggleSavedJobCommand(user.sub, jobListingId);
		const result = await this.toggleSavedJobUseCase.execute(command);

		return ToggleSavedJobResponseMapper.toDto(result);
	}

	@Get("saved-jobs")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a paginated list of your saved jobs." })
	@ApiSuccessResponse(
		PaginatedSavedJobsResponseDto,
		HttpStatus.OK,
		"Saved jobs retrieved successfully.",
	)
	public async getSavedJobs(
		@CurrentUser() user: JwtPayload,
		@Query() queryDto: PaginationDto,
	): Promise<PaginatedSavedJobsResponseDto> {
		const query = new GetSavedJobsQuery(user.sub, queryDto.limit, queryDto.offset);
		const result = await this.getSavedJobsUseCase.execute(query);

		return PaginatedSavedJobsResponseMapper.toDto(result, queryDto.limit, queryDto.offset);
	}
}
