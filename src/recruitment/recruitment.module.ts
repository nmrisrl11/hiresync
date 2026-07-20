import { DatabaseModule } from "@/shared/database/database.module";
import { Module } from "@nestjs/common";
import { EmployerProfileRepository, JobListingRepository } from "./domain/repositories";
import {
	PrismaEmployerProfileRepository,
	PrismaJobListingRepository,
} from "./infrastructure/adapters/persistence";
import {
	CloseJobListingUseCasePort,
	CreateEmployerProfileUseCasePort,
	CreateJobListingUseCasePort,
	EditJobListingUseCasePort,
	GetEmployerJobsUseCasePort,
} from "./application/ports/inbound/employers";
import {
	CloseJobListingUseCase,
	CreateEmployerProfileUseCase,
	CreateJobListingUseCase,
	EditJobListingUseCase,
	GetEmployerJobsUseCase,
} from "./application/use-cases/employers";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { NestjsEventDispatcherAdapter } from "@/shared/infrastructure/adapters";
import { EmployerController } from "./presentation/controllers/employer.controller";

@Module({
	imports: [DatabaseModule],
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

		//! Shared
		{ provide: DomainEventDispatcherPort, useClass: NestjsEventDispatcherAdapter },
	],
})
export class RecruitmentModule {}
