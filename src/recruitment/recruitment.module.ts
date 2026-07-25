import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { DatabaseModule } from "@/shared/database/database.module";
import { NestjsEventDispatcherAdapter } from "@/shared/infrastructure/adapters";
import { Module } from "@nestjs/common";
import {
	CreateApplicantProfileUseCasePort,
	EditApplicantProfileUseCasePort,
	GetApplicantProfileUseCasePort,
	GetSavedJobsUseCasePort,
	ToggleSavedJobUseCasePort,
} from "./application/ports/inbound/applicants";
import {
	ApplyForJobUseCasePort,
	BulkUpdateApplicationStatusUseCasePort,
	GetApplicantApplicationsUseCasePort,
	GetEmployerApplicationsUseCasePort,
	UpdateApplicationStatusUseCasePort,
	WithdrawApplicationUseCasePort,
} from "./application/ports/inbound/applications";
import {
	CreateEmployerProfileUseCasePort,
	EditEmployerProfileUseCasePort,
	GetApplicantProfileForEmployerUseCasePort,
	GetEmployerProfileByIdUseCasePort,
	GetEmployerProfileUseCasePort,
	RemoveCompanyLogoUseCasePort,
	UploadCompanyLogoUseCasePort,
} from "./application/ports/inbound/employers";
import {
	CloseJobListingUseCasePort,
	CreateJobListingUseCasePort,
	EditJobListingUseCasePort,
	ExpireJobListingsUseCasePort,
	GetEmployerJobsUseCasePort,
	GetJobListingByIdUseCasePort,
	SearchJobListingUseCasePort,
} from "./application/ports/inbound/jobs";
import {
	EnqueueApplicantWelcomeEmailUseCasePort,
	EnqueueApplicationStatusUpdatedUseCasePort,
	EnqueueApplicationSubmittedUseCasePort,
	EnqueueApplicationWithdrawnUseCasePort,
	EnqueueEmployerWelcomeEmailUseCasePort,
	EnqueueJobClosedEmailUseCasePort,
	EnqueueJobCreatedEmailUseCasePort,
} from "./application/ports/inbound/notifications";
import {
	DocumentStoragePort,
	ImageStoragePort,
	RecruitmentEmailQueuePort,
	UserIntegrationPort,
} from "./application/ports/outbound";
import {
	CreateApplicantProfileUseCase,
	EditApplicantProfileUseCase,
	GetApplicantProfileUseCase,
	GetSavedJobsUseCase,
	ToggleSavedJobUseCase,
} from "./application/use-cases/applicants";
import {
	ApplyForJobUseCase,
	BulkUpdateApplicationStatusUseCase,
	GetApplicantApplicationsUseCase,
	GetEmployerApplicationsUseCase,
	UpdateApplicationStatusUseCase,
	WithdrawApplicationUseCase,
} from "./application/use-cases/applications";
import {
	CreateEmployerProfileUseCase,
	EditEmployerProfileUseCase,
	GetApplicantProfileForEmployerUseCase,
	GetEmployerProfileByIdUseCase,
	GetEmployerProfileUseCase,
	RemoveCompanyLogoUseCase,
	UploadCompanyLogoUseCase,
} from "./application/use-cases/employers";
import {
	CloseJobListingUseCase,
	CreateJobListingUseCase,
	EditJobListingUseCase,
	ExpireJobListingsUseCase,
	GetEmployerJobsUseCase,
	GetJobListingByIdUseCase,
	SearchJobListingUseCase,
} from "./application/use-cases/jobs";
import {
	EnqueueApplicantWelcomeEmailUseCase,
	EnqueueApplicationStatusUpdatedUseCase,
	EnqueueApplicationSubmittedUseCase,
	EnqueueApplicationWithdrawnUseCase,
	EnqueueEmployerWelcomeEmailUseCase,
	EnqueueJobClosedEmailUseCase,
	EnqueueJobCreatedEmailUseCase,
} from "./application/use-cases/notifications";
import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobApplicationRepository,
	JobListingRepository,
	SavedJobRepository,
} from "./domain/repositories";
import {
	BullMqRecruitmentEmailQueueAdapter,
	CloudinaryDocumentStorageAdapter,
	CloudinaryImageStorageAdapter,
	PrismaUserIntegrationAdapter,
} from "./infrastructure/adapters";
import {
	PrismaApplicantProfileRepository,
	PrismaEmployerProfileRepository,
	PrismaJobApplicationRepository,
	PrismaJobListingRepository,
	PrismaSavedJobRepository,
} from "./infrastructure/adapters/persistence";
import { ExpireJobListingsCron } from "./infrastructure/cron/expire-job-listings.cron";
import { RecruitmentNotificationsModule } from "./infrastructure/notifications/recruitment-notifications.module";
import { ApplicantController } from "./presentation/controllers/applicant.controller";
import { EmployerController } from "./presentation/controllers/employer.controller";
import { RecruitmentController } from "./presentation/controllers/recruitment.controller";
import {
	ApplicantProfileCreatedListener,
	EmployerProfileCreatedListener,
	JobApplicationStatusUpdatedListener,
	JobApplicationSubmittedListener,
	JobApplicationWithdrawnListener,
	JobListingClosedListener,
	JobListingCreatedListener,
} from "./presentation/event-listeners";

@Module({
	imports: [DatabaseModule, RecruitmentNotificationsModule],
	controllers: [EmployerController, RecruitmentController, ApplicantController],
	providers: [
		//! Repositories and Persistence
		{ provide: EmployerProfileRepository, useClass: PrismaEmployerProfileRepository },
		{ provide: JobListingRepository, useClass: PrismaJobListingRepository },
		{ provide: ApplicantProfileRepository, useClass: PrismaApplicantProfileRepository },
		{ provide: JobApplicationRepository, useClass: PrismaJobApplicationRepository },
		{ provide: SavedJobRepository, useClass: PrismaSavedJobRepository },

		//! Use Cases
		{ provide: CreateEmployerProfileUseCasePort, useClass: CreateEmployerProfileUseCase },
		{ provide: EditEmployerProfileUseCasePort, useClass: EditEmployerProfileUseCase },
		{ provide: UploadCompanyLogoUseCasePort, useClass: UploadCompanyLogoUseCase },
		{ provide: RemoveCompanyLogoUseCasePort, useClass: RemoveCompanyLogoUseCase },
		{ provide: GetEmployerProfileUseCasePort, useClass: GetEmployerProfileUseCase },
		{ provide: GetEmployerProfileByIdUseCasePort, useClass: GetEmployerProfileByIdUseCase },
		{
			provide: GetApplicantProfileForEmployerUseCasePort,
			useClass: GetApplicantProfileForEmployerUseCase,
		},

		{ provide: CreateJobListingUseCasePort, useClass: CreateJobListingUseCase },
		{ provide: EditJobListingUseCasePort, useClass: EditJobListingUseCase },
		{ provide: CloseJobListingUseCasePort, useClass: CloseJobListingUseCase },
		{ provide: GetEmployerJobsUseCasePort, useClass: GetEmployerJobsUseCase },
		{ provide: GetJobListingByIdUseCasePort, useClass: GetJobListingByIdUseCase },
		{ provide: ExpireJobListingsUseCasePort, useClass: ExpireJobListingsUseCase },
		{ provide: SearchJobListingUseCasePort, useClass: SearchJobListingUseCase },

		{ provide: CreateApplicantProfileUseCasePort, useClass: CreateApplicantProfileUseCase },
		{ provide: EditApplicantProfileUseCasePort, useClass: EditApplicantProfileUseCase },
		{ provide: GetApplicantProfileUseCasePort, useClass: GetApplicantProfileUseCase },
		{ provide: ToggleSavedJobUseCasePort, useClass: ToggleSavedJobUseCase },
		{ provide: GetSavedJobsUseCasePort, useClass: GetSavedJobsUseCase },

		{ provide: ApplyForJobUseCasePort, useClass: ApplyForJobUseCase },
		{ provide: GetApplicantApplicationsUseCasePort, useClass: GetApplicantApplicationsUseCase },
		{ provide: GetEmployerApplicationsUseCasePort, useClass: GetEmployerApplicationsUseCase },
		{ provide: UpdateApplicationStatusUseCasePort, useClass: UpdateApplicationStatusUseCase },
		{ provide: WithdrawApplicationUseCasePort, useClass: WithdrawApplicationUseCase },
		{
			provide: BulkUpdateApplicationStatusUseCasePort,
			useClass: BulkUpdateApplicationStatusUseCase,
		},

		//! Outbound - Adapters
		{ provide: UserIntegrationPort, useClass: PrismaUserIntegrationAdapter },
		{ provide: RecruitmentEmailQueuePort, useClass: BullMqRecruitmentEmailQueueAdapter },
		{ provide: ImageStoragePort, useClass: CloudinaryImageStorageAdapter },
		{ provide: DocumentStoragePort, useClass: CloudinaryDocumentStorageAdapter },

		//! Domain Event and Event Listeners
		{
			provide: EnqueueEmployerWelcomeEmailUseCasePort,
			useClass: EnqueueEmployerWelcomeEmailUseCase,
		},
		{
			provide: EnqueueJobCreatedEmailUseCasePort,
			useClass: EnqueueJobCreatedEmailUseCase,
		},
		{
			provide: EnqueueJobClosedEmailUseCasePort,
			useClass: EnqueueJobClosedEmailUseCase,
		},
		{
			provide: EnqueueApplicantWelcomeEmailUseCasePort,
			useClass: EnqueueApplicantWelcomeEmailUseCase,
		},
		{
			provide: EnqueueApplicationSubmittedUseCasePort,
			useClass: EnqueueApplicationSubmittedUseCase,
		},
		{
			provide: EnqueueApplicationStatusUpdatedUseCasePort,
			useClass: EnqueueApplicationStatusUpdatedUseCase,
		},
		{
			provide: EnqueueApplicationWithdrawnUseCasePort,
			useClass: EnqueueApplicationWithdrawnUseCase,
		},
		EmployerProfileCreatedListener,
		JobListingCreatedListener,
		JobListingClosedListener,
		ApplicantProfileCreatedListener,
		JobApplicationSubmittedListener,
		JobApplicationStatusUpdatedListener,
		JobApplicationWithdrawnListener,

		//! CRON Jobs
		ExpireJobListingsCron,

		//! Shared
		{ provide: DomainEventDispatcherPort, useClass: NestjsEventDispatcherAdapter },
	],
})
export class RecruitmentModule {}
