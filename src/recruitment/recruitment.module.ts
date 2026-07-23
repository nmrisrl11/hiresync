import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { DatabaseModule } from "@/shared/database/database.module";
import { NestjsEventDispatcherAdapter } from "@/shared/infrastructure/adapters";
import { Module } from "@nestjs/common";
import {
	CreateApplicantProfileUseCasePort,
	EditApplicantProfileUseCasePort,
	GetApplicantProfileUseCasePort,
} from "./application/ports/inbound/applicants";
import {
	CreateEmployerProfileUseCasePort,
	EditEmployerProfileUseCasePort,
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
	EnqueueEmployerWelcomeEmailUseCasePort,
	EnqueueJobClosedEmailUseCasePort,
	EnqueueJobCreatedEmailUseCasePort,
} from "./application/ports/inbound/notifications";
import {
	ImageStoragePort,
	RecruitmentEmailQueuePort,
	UserIntegrationPort,
} from "./application/ports/outbound";
import {
	CreateApplicantProfileUseCase,
	EditApplicantProfileUseCase,
	GetApplicantProfileUseCase,
} from "./application/use-cases/applicants";
import {
	CreateEmployerProfileUseCase,
	EditEmployerProfileUseCase,
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
	EnqueueEmployerWelcomeEmailUseCase,
	EnqueueJobClosedEmailUseCase,
	EnqueueJobCreatedEmailUseCase,
} from "./application/use-cases/notifications";
import {
	ApplicantProfileRepository,
	EmployerProfileRepository,
	JobApplicationRepository,
	JobListingRepository,
} from "./domain/repositories";
import {
	BullMqRecruitmentEmailQueueAdapter,
	CloudinaryImageStorageAdapter,
	PrismaUserIntegrationAdapter,
} from "./infrastructure/adapters";
import {
	PrismaApplicantProfileRepository,
	PrismaEmployerProfileRepository,
	PrismaJobApplicationRepository,
	PrismaJobListingRepository,
} from "./infrastructure/adapters/persistence";
import { ExpireJobListingsCron } from "./infrastructure/cron/expire-job-listings.cron";
import { RecruitmentNotificationsModule } from "./infrastructure/notifications/recruitment-notifications.module";
import { ApplicantController } from "./presentation/controllers/applicant.controller";
import { EmployerController } from "./presentation/controllers/employer.controller";
import { RecruitmentController } from "./presentation/controllers/recruitment.controller";
import {
	ApplicantProfileCreatedListener,
	EmployerProfileCreatedListener,
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

		//! Use Cases
		{ provide: CreateEmployerProfileUseCasePort, useClass: CreateEmployerProfileUseCase },
		{ provide: EditEmployerProfileUseCasePort, useClass: EditEmployerProfileUseCase },
		{ provide: UploadCompanyLogoUseCasePort, useClass: UploadCompanyLogoUseCase },
		{ provide: RemoveCompanyLogoUseCasePort, useClass: RemoveCompanyLogoUseCase },
		{ provide: GetEmployerProfileUseCasePort, useClass: GetEmployerProfileUseCase },
		{ provide: GetEmployerProfileByIdUseCasePort, useClass: GetEmployerProfileByIdUseCase },

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

		//! Outbound - Adapters
		{ provide: UserIntegrationPort, useClass: PrismaUserIntegrationAdapter },
		{ provide: RecruitmentEmailQueuePort, useClass: BullMqRecruitmentEmailQueueAdapter },
		{ provide: ImageStoragePort, useClass: CloudinaryImageStorageAdapter },

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
		EmployerProfileCreatedListener,
		JobListingCreatedListener,
		JobListingClosedListener,
		ApplicantProfileCreatedListener,

		//! CRON Jobs
		ExpireJobListingsCron,

		//! Shared
		{ provide: DomainEventDispatcherPort, useClass: NestjsEventDispatcherAdapter },
	],
})
export class RecruitmentModule {}
