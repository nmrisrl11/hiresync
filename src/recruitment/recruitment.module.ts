import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { DatabaseModule } from "@/shared/database/database.module";
import { NestjsEventDispatcherAdapter } from "@/shared/infrastructure/adapters";
import { QueueModule } from "@/shared/queue/queue.module";
import { Module } from "@nestjs/common";
import {
	CloseJobListingUseCasePort,
	CreateEmployerProfileUseCasePort,
	CreateJobListingUseCasePort,
	EditJobListingUseCasePort,
	GetEmployerJobsUseCasePort,
} from "./application/ports/inbound/employers";
import {
	EnqueueEmployerWelcomeEmailUseCasePort,
	EnqueueJobCreatedEmailUseCasePort,
} from "./application/ports/inbound/notifications";
import { RecruitmentEmailQueuePort, UserIntegrationPort } from "./application/ports/outbound";
import {
	CloseJobListingUseCase,
	CreateEmployerProfileUseCase,
	CreateJobListingUseCase,
	EditJobListingUseCase,
	GetEmployerJobsUseCase,
} from "./application/use-cases/employers";
import {
	EnqueueEmployerWelcomeEmailUseCase,
	EnqueueJobCreatedEmailUseCase,
} from "./application/use-cases/notifications";
import { EmployerProfileRepository, JobListingRepository } from "./domain/repositories";
import {
	BullMqRecruitmentEmailQueueAdapter,
	PrismaUserIntegrationAdapter,
} from "./infrastructure/adapters";
import {
	PrismaEmployerProfileRepository,
	PrismaJobListingRepository,
} from "./infrastructure/adapters/persistence";
import { EmployerController } from "./presentation/controllers/employer.controller";
import {
	EmployerProfileCreatedListener,
	JobListingCreatedListener,
} from "./presentation/event-listeners";

@Module({
	imports: [DatabaseModule, QueueModule],
	controllers: [EmployerController],
	providers: [
		//! Repositories and Persistence
		{ provide: EmployerProfileRepository, useClass: PrismaEmployerProfileRepository },
		{ provide: JobListingRepository, useClass: PrismaJobListingRepository },

		//! Use Cases
		{ provide: CreateEmployerProfileUseCasePort, useClass: CreateEmployerProfileUseCase },
		{ provide: CreateJobListingUseCasePort, useClass: CreateJobListingUseCase },
		{ provide: EditJobListingUseCasePort, useClass: EditJobListingUseCase },
		{ provide: CloseJobListingUseCasePort, useClass: CloseJobListingUseCase },
		{ provide: GetEmployerJobsUseCasePort, useClass: GetEmployerJobsUseCase },

		//! Outbound - Adapters
		{ provide: UserIntegrationPort, useClass: PrismaUserIntegrationAdapter },
		{ provide: RecruitmentEmailQueuePort, useClass: BullMqRecruitmentEmailQueueAdapter },

		//! Domain Event and Event Listeners
		{
			provide: EnqueueEmployerWelcomeEmailUseCasePort,
			useClass: EnqueueEmployerWelcomeEmailUseCase,
		},
		{
			provide: EnqueueJobCreatedEmailUseCasePort,
			useClass: EnqueueJobCreatedEmailUseCase,
		},
		EmployerProfileCreatedListener,
		JobListingCreatedListener,

		//! Shared
		{ provide: DomainEventDispatcherPort, useClass: NestjsEventDispatcherAdapter },
	],
})
export class RecruitmentModule {}
