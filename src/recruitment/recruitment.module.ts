import { DomainEventPublisherPort } from "@/shared/application/ports/outbound";
import { DatabaseModule } from "@/shared/database/database.module";
import { NestjsDomainEventPublisherAdapter } from "@/shared/infrastructure/adapters";
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
	UpdateInternalNoteUseCasePort,
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
import { CleanupRecruitmentDataUseCasePort } from "./application/ports/inbound/system";
import {
	DocumentStoragePort,
	ImageStoragePort,
	RecruitmentAssetQueuePort,
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
	UpdateInternalNoteUseCase,
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
import { CleanupRecruitmentDataUseCase } from "./application/use-cases/system";
import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobApplicationRepository,
	JobListingRepository,
	SavedJobRepository,
} from "./domain/repositories";
import {
	BullMqRecruitmentAssetQueueAdapter,
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
import {
	ApplicantProfileCreatedListener,
	EmployerProfileCreatedListener,
	JobApplicationStatusUpdatedListener,
	JobApplicationSubmittedListener,
	JobApplicationWithdrawnListener,
	JobListingClosedListener,
	JobListingCreatedListener,
	UserAccountDeletingListener,
} from "./infrastructure/events/listeners";
import { RecruitmentNotificationsModule } from "./infrastructure/notifications/recruitment-notifications.module";
import { RecruitmentAssetProcessor } from "./infrastructure/queues";
import { ApplicantController } from "./presentation/controllers/applicant.controller";
import { EmployerController } from "./presentation/controllers/employer.controller";
import { RecruitmentController } from "./presentation/controllers/recruitment.controller";
import { BullModule } from "@nestjs/bullmq";

@Module({
	imports: [
		DatabaseModule,
		RecruitmentNotificationsModule,
		BullModule.registerQueue({ name: "recruitment-asset-queue" }),
	],
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
		{
			provide: UpdateInternalNoteUseCasePort,
			useClass: UpdateInternalNoteUseCase,
		},
		{
			provide: CleanupRecruitmentDataUseCasePort,
			useClass: CleanupRecruitmentDataUseCase,
		},

		//! Outbound - Adapters
		{ provide: UserIntegrationPort, useClass: PrismaUserIntegrationAdapter },
		{ provide: RecruitmentEmailQueuePort, useClass: BullMqRecruitmentEmailQueueAdapter },
		{ provide: ImageStoragePort, useClass: CloudinaryImageStorageAdapter },
		{ provide: DocumentStoragePort, useClass: CloudinaryDocumentStorageAdapter },
		{ provide: RecruitmentAssetQueuePort, useClass: BullMqRecruitmentAssetQueueAdapter },

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
		UserAccountDeletingListener,

		//! Processors
		RecruitmentAssetProcessor,
		//! CRON Jobs
		ExpireJobListingsCron,

		//! Shared
		{ provide: DomainEventPublisherPort, useClass: NestjsDomainEventPublisherAdapter },
	],
})
export class RecruitmentModule {}
