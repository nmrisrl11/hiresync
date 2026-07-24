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
import { type JwtPayload } from "@/shared/application/types";
import { ROLES } from "@/shared/domain/types/role.type";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { Roles } from "@/shared/presentation/decorators/roles.decorator";
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
	ApplyForJobDto,
	CreateApplicantProfileDto,
	EditApplicantProfileDto,
	GetApplicationsDto,
	PaginationDto,
} from "../dtos";
import { RecruitmentExceptionFilter } from "../filters/recruitment-exception.filter";
import { DocumentValidationPipe } from "../pipes/document-validation.pipe";

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
	public async applyForJob(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ApplyForJobDto,
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

		return { message: "Application submitted successfully.", applicationId };
	}

	@Get("applications")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a paginated list of your submitted applications." })
	public async getApplications(
		@CurrentUser() user: JwtPayload,
		@Query() queryDto: GetApplicationsDto,
	) {
		const query = new GetApplicantApplicationsQuery(
			user.sub,
			queryDto.limit,
			queryDto.offset,
			queryDto.status,
		);

		const { items, total } = await this.getApplicantApplicationsUseCase.execute(query);

		return {
			data: items,
			meta: { total, limit: queryDto.limit, offset: queryDto.offset },
		};
	}

	@Patch("applications/:id/withdraw")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 15 } })
	@ApiOperation({ summary: "Withdraw a pending job application." })
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
	public async toggleSavedJob(
		@CurrentUser() user: JwtPayload,
		@Param("jobListingId") jobListingId: string,
	) {
		const command = new ToggleSavedJobCommand(user.sub, jobListingId);
		const result = await this.toggleSavedJobUseCase.execute(command);

		return {
			message: result.saved ? "Job saved successfully." : "Job removed from saved list.",
			data: result,
		};
	}

	@Get("saved-jobs")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get a paginated list of your saved jobs." })
	public async getSavedJobs(@CurrentUser() user: JwtPayload, @Query() queryDto: PaginationDto) {
		const query = new GetSavedJobsQuery(user.sub, queryDto.limit, queryDto.offset);
		const { items, total } = await this.getSavedJobsUseCase.execute(query);

		return {
			data: items,
			meta: { total, limit: queryDto.limit, offset: queryDto.offset },
		};
	}
}
