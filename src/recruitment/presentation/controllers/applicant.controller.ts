import {
	CreateApplicantProfileCommand,
	CreateApplicantProfileUseCasePort,
	DeleteApplicantDocumentCommand,
	DeleteApplicantDocumentUseCasePort,
	EditApplicantProfileCommand,
	EditApplicantProfileUseCasePort,
	GetApplicantDocumentsQuery,
	GetApplicantDocumentsUseCasePort,
	GetApplicantProfileQuery,
	GetApplicantProfileUseCasePort,
	GetSavedJobsQuery,
	GetSavedJobsUseCasePort,
	SetPrimaryApplicantDocumentCommand,
	SetPrimaryApplicantDocumentUseCasePort,
	ToggleSavedJobCommand,
	ToggleSavedJobUseCasePort,
	UploadApplicantDocumentCommand,
	UploadApplicantDocumentUseCasePort,
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
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import {
	ApplicantDocumentResponseDto,
	ApplicantProfileResponseDto,
	CreateApplicantProfileRequestDto,
	EditApplicantProfileRequestDto,
	PaginatedSavedJobsResponseDto,
	SetPrimaryDocumentRequestDto,
	ToggleSavedJobResponseDto,
	UploadApplicantDocumentResponseDto,
} from "../dtos/applicants";
import {
	ApplyForJobRequestDto,
	ApplyForJobResponseDto,
	GetApplicationsRequestDto,
	PaginatedApplicantApplicationsResponseDto,
} from "../dtos/applications";
import { RecruitmentExceptionFilter } from "../filters/recruitment-exception.filter";
import {
	ApplicantDocumentResponseMapper,
	ApplicantProfileResponseMapper,
	PaginatedSavedJobsResponseMapper,
	ToggleSavedJobResponseMapper,
	UploadApplicantDocumentResponseMapper,
} from "../mappers/applicants";
import {
	ApplyForJobResponseMapper,
	PaginatedApplicantApplicationsResponseMapper,
} from "../mappers/applications";
import { DOCUMENT_TYPE, type DocumentType } from "@/recruitment/domain/types";
import { FileInterceptor } from "@nestjs/platform-express";

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
		private readonly uploadApplicantDocumentUseCase: UploadApplicantDocumentUseCasePort,
		private readonly getApplicantDocumentsUseCase: GetApplicantDocumentsUseCasePort,
		private readonly deleteApplicantDocumentUseCase: DeleteApplicantDocumentUseCasePort,
		private readonly setPrimaryApplicantDocumentUseCase: SetPrimaryApplicantDocumentUseCasePort,
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

	@Get("documents")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 30 } })
	@ApiOperation({ summary: "Get all uploaded resumes and cover letters." })
	@ApiSuccessResponse(
		ApplicantDocumentResponseDto,
		HttpStatus.OK,
		"Documents retrieved successfully.",
	)
	public async getDocuments(
		@CurrentUser() user: JwtPayload,
	): Promise<ApplicantDocumentResponseDto[]> {
		const query = new GetApplicantDocumentsQuery(user.sub);
		const documents = await this.getApplicantDocumentsUseCase.execute(query);
		return ApplicantDocumentResponseMapper.toDtoList(documents);
	}

	@Post("documents")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 10 } })
	@ApiOperation({ summary: "Upload a new resume (PDF) or cover letter (TXT)." })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			required: ["type", "file"],
			properties: {
				type: { type: "string", enum: Object.values(DOCUMENT_TYPE) },
				file: {
					type: "string",
					format: "binary",
					description: "Max 5MB. PDF for resumes, TXT for cover letters.",
				},
			},
		},
	})
	@UseInterceptors(FileInterceptor("file"))
	@ApiSuccessResponse(
		UploadApplicantDocumentResponseDto,
		HttpStatus.CREATED,
		"Document uploaded successfully.",
	)
	public async uploadDocument(
		@CurrentUser() user: JwtPayload,
		@Body("type") type: DocumentType,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
					new FileTypeValidator({
						fileType: /^(application\/pdf|text\/plain)$/,
						errorMessage: "Only PDF and TXT files are allowed.",
						skipMagicNumbersValidation: true, //! Skipping it to allows the validator to properly fall back to mimetype checking.
					}),
				],
			}),
		)
		file: Express.Multer.File,
	): Promise<UploadApplicantDocumentResponseDto> {
		const command = new UploadApplicantDocumentCommand(
			user.sub,
			type,
			file.buffer,
			file.originalname,
		);
		const result = await this.uploadApplicantDocumentUseCase.execute(command);
		return UploadApplicantDocumentResponseMapper.toDto(result);
	}

	@Delete("documents/:id")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 15 } })
	@ApiOperation({ summary: "Delete a specific document." })
	@ApiMessageResponse(HttpStatus.OK, "Document deleted successfully.")
	public async deleteDocument(@CurrentUser() user: JwtPayload, @Param("id") documentId: string) {
		const command = new DeleteApplicantDocumentCommand(user.sub, documentId);
		await this.deleteApplicantDocumentUseCase.execute(command);
		return { message: "Document deleted successfully." };
	}

	@Patch("documents/:id/primary")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { ttl: 60000, limit: 15 } })
	@ApiOperation({ summary: "Set a document as the primary default for its type." })
	@ApiMessageResponse(HttpStatus.OK, "Primary document updated successfully.")
	public async setPrimaryDocument(
		@CurrentUser() user: JwtPayload,
		@Param("id") documentId: string,
		@Body() dto: SetPrimaryDocumentRequestDto,
	) {
		const command = new SetPrimaryApplicantDocumentCommand(user.sub, documentId, dto.type);
		await this.setPrimaryApplicantDocumentUseCase.execute(command);
		return { message: "Primary document updated successfully." };
	}

	@Post("applications")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { ttl: 60000, limit: 5 } })
	@ApiOperation({ summary: "Apply for a job listing using stored document IDs." })
	@ApiSuccessResponse(
		ApplyForJobResponseDto,
		HttpStatus.CREATED,
		"Application submitted successfully.",
	)
	public async applyForJob(
		@CurrentUser() user: JwtPayload,
		@Body() dto: ApplyForJobRequestDto,
	): Promise<ApplyForJobResponseDto> {
		const command = new ApplyForJobCommand(
			user.sub,
			dto.jobListingId,
			dto.resumeDocumentId,
			dto.coverLetterDocumentId,
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
