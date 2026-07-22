import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { DatabaseModule } from "@/shared/database/database.module";
import { NestjsEventDispatcherAdapter } from "@/shared/infrastructure/adapters";
import { Module } from "@nestjs/common";
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
	GetEmployerJobsUseCasePort,
	GetJobListingByIdUseCasePort,
} from "./application/ports/inbound/jobs";
import {
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
	GetEmployerJobsUseCase,
	GetJobListingByIdUseCase,
} from "./application/use-cases/jobs";
import {
	EnqueueEmployerWelcomeEmailUseCase,
	EnqueueJobClosedEmailUseCase,
	EnqueueJobCreatedEmailUseCase,
} from "./application/use-cases/notifications";
import { EmployerProfileRepository, JobListingRepository } from "./domain/repositories";
import {
	BullMqRecruitmentEmailQueueAdapter,
	CloudinaryImageStorageAdapter,
	PrismaUserIntegrationAdapter,
} from "./infrastructure/adapters";
import {
	PrismaEmployerProfileRepository,
	PrismaJobListingRepository,
} from "./infrastructure/adapters/persistence";
import { RecruitmentNotificationsModule } from "./infrastructure/notifications/recruitment-notifications.module";
import { EmployerController } from "./presentation/controllers/employer.controller";
import { RecruitmentController } from "./presentation/controllers/recruitment.controller";
import {
	EmployerProfileCreatedListener,
	JobListingClosedListener,
	JobListingCreatedListener,
} from "./presentation/event-listeners";

@Module({
	imports: [DatabaseModule, RecruitmentNotificationsModule],
	controllers: [EmployerController, RecruitmentController],
	providers: [
		//! Repositories and Persistence
		{ provide: EmployerProfileRepository, useClass: PrismaEmployerProfileRepository },
		{ provide: JobListingRepository, useClass: PrismaJobListingRepository },

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
		EmployerProfileCreatedListener,
		JobListingCreatedListener,
		JobListingClosedListener,

		//! Shared
		{ provide: DomainEventDispatcherPort, useClass: NestjsEventDispatcherAdapter },
	],
})
export class RecruitmentModule {}
