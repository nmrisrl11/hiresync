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
} from "./application/ports/inbound/employers";
import {
	CloseJobListingUseCase,
	CreateEmployerProfileUseCase,
	CreateJobListingUseCase,
	EditJobListingUseCase,
} from "./application/use-cases/employers";
import { DomainEventDispatcherPort } from "@/shared/application/ports/outbound";
import { NestjsEventDispatcherAdapter } from "@/shared/infrastructure/adapters";

@Module({
	imports: [DatabaseModule],
	controllers: [],
	providers: [
		//! Repositories and Persistence
		{ provide: EmployerProfileRepository, useClass: PrismaEmployerProfileRepository },
		{ provide: JobListingRepository, useClass: PrismaJobListingRepository },

		//! Use Cases
		{ provide: CreateEmployerProfileUseCasePort, useClass: CreateEmployerProfileUseCase },
		{ provide: CreateJobListingUseCasePort, useClass: CreateJobListingUseCase },
		{ provide: EditJobListingUseCasePort, useClass: EditJobListingUseCase },
		{ provide: CloseJobListingUseCasePort, useClass: CloseJobListingUseCase },

		//! Shared
		{ provide: DomainEventDispatcherPort, useClass: NestjsEventDispatcherAdapter },
	],
})
export class RecruitmentModule {}
