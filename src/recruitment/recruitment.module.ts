import { DatabaseModule } from "@/shared/database/database.module";
import { Module } from "@nestjs/common";
import { EmployerProfileRepository, JobListingRepository } from "./domain/repositories";
import {
	PrismaEmployerProfileRepository,
	PrismaJobListingRepository,
} from "./infrastructure/adapters/persistence";
import {
	CreateEmployerProfileUseCasePort,
	CreateJobListingUseCasePort,
} from "./application/ports/inbound/employers";
import {
	CreateEmployerProfileUseCase,
	CreateJobListingUseCase,
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

		//! Shared
		{ provide: DomainEventDispatcherPort, useClass: NestjsEventDispatcherAdapter },
	],
})
export class RecruitmentModule {}
